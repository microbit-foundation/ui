/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import type { MessageFormatElement } from "@formatjs/icu-messageformat-parser";
import type { ResolvedCatalog, ResolvedConfig } from "./config.ts";
import { catalogLocales, expandTemplate, translationPath } from "./config.ts";
import { parseMessage } from "./icu.ts";
import { readCatalog } from "./messages.ts";
import type { Catalog } from "./index.ts";

export interface CompileResult {
  written: string[];
  warnings: string[];
}

/**
 * Where a package keeps its catalogs, resolved from the repo root so the
 * package is whatever the app has installed (or linked).
 */
export const packageLangDir = (name: string, root: string): string => {
  const require = createRequire(path.join(root, "package.json"));
  return path.dirname(require.resolve(`${name}/lang/ui.en.json`));
};

const readOptional = (file: string): Catalog | undefined =>
  fs.existsSync(file) ? readCatalog(file) : undefined;

/**
 * English overlaid with whatever the translation has. Ids the translation
 * has but English no longer does are dropped.
 */
const overlay = (
  english: Catalog,
  translation: Catalog | undefined,
): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const [id, { defaultMessage }] of Object.entries(english)) {
    result[id] = translation?.[id]?.defaultMessage ?? defaultMessage;
  }
  return result;
};

export interface MergedMessages {
  messages: Record<string, string>;
  warnings: string[];
}

/**
 * All the messages the app loads for one locale: its own catalog and each
 * package's, every one backfilled from its English source.
 */
export const mergeMessages = (
  config: ResolvedConfig,
  catalog: ResolvedCatalog,
  locale: string,
): MergedMessages => {
  const { root } = config;
  const warnings: string[] = [];
  const english = readCatalog(path.resolve(root, catalog.source));
  const isEnglish = locale.toLowerCase() === "en";
  const translation = isEnglish
    ? undefined
    : readOptional(path.resolve(root, translationPath(catalog, locale)));
  const messages = overlay(english, translation);
  for (const name of catalog.packages) {
    const dir = packageLangDir(name, root);
    const packageEnglish = readCatalog(path.join(dir, "ui.en.json"));
    // Packages published before the catalogs took canonical casing ship
    // lowercase names.
    const packageTranslation = isEnglish
      ? undefined
      : readOptional(path.join(dir, `ui.${locale}.json`)) ??
        readOptional(path.join(dir, `ui.${locale.toLowerCase()}.json`));
    if (!isEnglish && !packageTranslation && !catalog.local.includes(locale)) {
      warnings.push(
        `${name} has no ui.${locale}.json; its English text will be used`,
      );
    }
    for (const [id, message] of Object.entries(
      overlay(packageEnglish, packageTranslation),
    )) {
      if (id in messages) {
        throw new Error(
          `Message id ${id} is in both ${catalog.source} and ${name}`,
        );
      }
      messages[id] = message;
    }
  }
  return { messages, warnings };
};

export const toAst = (
  messages: Record<string, string>,
): Record<string, MessageFormatElement[]> => {
  const result: Record<string, MessageFormatElement[]> = {};
  for (const id of Object.keys(messages).sort()) {
    try {
      result[id] = parseMessage(messages[id]);
    } catch (e) {
      throw new Error(`Message ${id} does not parse: ${(e as Error).message}`, {
        cause: e,
      });
    }
  }
  return result;
};

/**
 * Writes the compiled per-locale catalogs for one config catalog: formatjs
 * AST JSON, as `formatjs compile --ast` produced, which react-intl loads
 * without parsing at runtime.
 */
export const compileCatalog = (
  config: ResolvedConfig,
  catalog: ResolvedCatalog,
): CompileResult => {
  if (!catalog.out) {
    return { written: [], warnings: [] };
  }
  const written: string[] = [];
  const warnings: string[] = [];
  for (const locale of catalogLocales(config, catalog)) {
    const merged = mergeMessages(config, catalog, locale);
    warnings.push(...merged.warnings);
    const out = path.resolve(config.root, expandTemplate(catalog.out, locale));
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(
      out,
      JSON.stringify(toAst(merged.messages), null, 2) + "\n",
    );
    written.push(path.relative(config.root, out));
  }
  return { written, warnings };
};
