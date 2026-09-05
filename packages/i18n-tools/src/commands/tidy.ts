/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import fs from "node:fs";
import path from "node:path";
import {
  catalogLocales,
  inContextLanguage,
  strayTranslationFiles,
  translationPath,
  type ResolvedConfig,
} from "../config.ts";
import {
  formatIssues,
  readCatalog,
  serializeCatalog,
  tidySource,
  tidyTranslation,
  validateSource,
  validateTranslation,
  type Issue,
} from "../messages.ts";
import type { Catalog } from "../index.ts";

export interface TidyOptions {
  /** Report files that would change instead of writing them. */
  check?: boolean;
}

export interface TidyResult {
  changed: string[];
  issues: Issue[];
  warnings: string[];
}

const tidyFile = (
  root: string,
  relative: string,
  tidied: Catalog,
  check: boolean,
  changed: string[],
): void => {
  const file = path.resolve(root, relative);
  const serialized = serializeCatalog(tidied);
  const current = fs.existsSync(file)
    ? fs.readFileSync(file, "utf-8")
    : undefined;
  if (current === serialized) {
    return;
  }
  changed.push(relative);
  if (!check) {
    fs.writeFileSync(file, serialized);
  }
};

/**
 * Sorts and prunes every catalog and checks translations keep their
 * placeholders. Translated files end up holding only real translations (see
 * tidyTranslation), so this is also the migration from English-backfilled
 * files.
 */
export const tidy = (
  config: ResolvedConfig,
  { check = false }: TidyOptions = {},
): TidyResult => {
  const changed: string[] = [];
  const issues: Issue[] = [];
  const warnings: string[] = [];
  for (const catalog of config.catalogs) {
    const english = readCatalog(path.resolve(config.root, catalog.source));
    issues.push(...validateSource(catalog.source, english));
    tidyFile(config.root, catalog.source, tidySource(english), check, changed);
    for (const locale of catalogLocales(config, catalog)) {
      if (locale === "en") {
        continue;
      }
      const relative = translationPath(catalog, locale);
      const file = path.resolve(config.root, relative);
      if (!fs.existsSync(file)) {
        continue;
      }
      const tidied = tidyTranslation(english, readCatalog(file), {
        overrides: catalog.local.includes(locale),
      });
      if (locale !== inContextLanguage) {
        issues.push(...validateTranslation(relative, english, tidied));
      }
      tidyFile(config.root, relative, tidied, check, changed);
    }
    for (const stray of strayTranslationFiles(config, catalog)) {
      warnings.push(
        `${stray} is for a language the config does not list; add it to \`languages\` or delete the file`,
      );
    }
  }
  return { changed, issues, warnings };
};

export const runTidy = (
  config: ResolvedConfig,
  options: TidyOptions,
): number => {
  const { changed, issues, warnings } = tidy(config, options);
  for (const warning of warnings) {
    console.warn(`warning: ${warning}`);
  }
  if (options.check && changed.length) {
    console.error("These catalogs need tidying (run `microbit-i18n tidy`):");
    for (const file of changed) {
      console.error(`  ${file}`);
    }
  } else {
    for (const file of changed) {
      console.log(`tidied ${file}`);
    }
  }
  if (issues.length) {
    console.error(formatIssues(issues));
    return 2;
  }
  return options.check && changed.length ? 1 : 0;
};
