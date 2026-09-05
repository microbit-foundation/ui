/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import fs from "node:fs";
import path from "node:path";
import type { Catalog, MessageDescriptor } from "./index.ts";
import { describeSignatureDifference, parseMessage } from "./icu.ts";

export interface Issue {
  file: string;
  id: string;
  message: string;
}

const isDescriptor = (value: unknown): value is MessageDescriptor =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as MessageDescriptor).defaultMessage === "string";

export const parseCatalog = (text: string, name: string): Catalog => {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (e) {
    throw new Error(`${name}: ${(e as Error).message}`, { cause: e });
  }
  if (typeof json !== "object" || json === null || Array.isArray(json)) {
    throw new Error(`${name}: expected an object of messages`);
  }
  for (const [id, value] of Object.entries(json)) {
    if (!isDescriptor(value)) {
      throw new Error(`${name}: message ${id} has no defaultMessage string`);
    }
  }
  return json as Catalog;
};

export const readCatalog = (file: string): Catalog =>
  parseCatalog(fs.readFileSync(file, "utf-8"), file);

export const serializeCatalog = (catalog: Catalog): string =>
  JSON.stringify(catalog, null, 2) + "\n";

export const writeCatalog = (file: string, catalog: Catalog): void => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, serializeCatalog(catalog));
};

const sortedIds = (catalog: Catalog): string[] => Object.keys(catalog).sort();

/**
 * The English source, sorted by id so it doesn't matter where new messages
 * are added. Descriptions are kept: they are the translators' context.
 */
export const tidySource = (source: Catalog): Catalog => {
  const result: Catalog = {};
  for (const id of sortedIds(source)) {
    const { defaultMessage, description } = source[id];
    result[id] =
      description === undefined
        ? { defaultMessage }
        : { defaultMessage, description };
  }
  return result;
};

export interface TidyTranslationOptions {
  /**
   * A hand-maintained locale such as en-US: keep only messages that differ
   * from English, since English is the fallback anyway.
   */
  overrides?: boolean;
}

/**
 * A translated catalog holds only what the language actually has: ids still
 * in the source, no descriptions, no empty strings. Missing messages fall
 * back to English at compile time rather than being copied in here, so a
 * diff shows real translation changes and nothing else.
 */
export const tidyTranslation = (
  source: Catalog,
  translated: Catalog,
  { overrides = false }: TidyTranslationOptions = {},
): Catalog => {
  const result: Catalog = {};
  for (const id of sortedIds(translated)) {
    const english = source[id];
    if (!english) {
      continue;
    }
    const { defaultMessage } = translated[id];
    if (defaultMessage === "") {
      continue;
    }
    if (overrides && defaultMessage === english.defaultMessage) {
      continue;
    }
    result[id] = { defaultMessage };
  }
  return result;
};

export const validateSource = (file: string, source: Catalog): Issue[] => {
  const issues: Issue[] = [];
  for (const [id, { defaultMessage }] of Object.entries(source)) {
    try {
      parseMessage(defaultMessage);
    } catch (e) {
      issues.push({
        file,
        id,
        message: `does not parse: ${(e as Error).message}`,
      });
    }
  }
  return issues;
};

/**
 * Checks each translation parses and keeps the English message's arguments
 * and tags. Plural categories may legitimately differ between languages, so
 * only the argument names are compared.
 */
export const validateTranslation = (
  file: string,
  source: Catalog,
  translated: Catalog,
): Issue[] => {
  const issues: Issue[] = [];
  for (const [id, { defaultMessage }] of Object.entries(translated)) {
    const english = source[id];
    if (!english) {
      continue;
    }
    let difference: string | undefined;
    try {
      difference = describeSignatureDifference(
        english.defaultMessage,
        defaultMessage,
      );
    } catch (e) {
      issues.push({
        file,
        id,
        message: `does not parse: ${(e as Error).message}`,
      });
      continue;
    }
    if (difference) {
      issues.push({
        file,
        id,
        message: `${difference}\n    en: ${english.defaultMessage}\n    tr: ${defaultMessage}`,
      });
    }
  }
  return issues;
};

export const formatIssues = (issues: Issue[]): string =>
  issues.map((i) => `${i.file}: ${i.id}: ${i.message}`).join("\n");
