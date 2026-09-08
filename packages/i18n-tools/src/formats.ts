/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Catalog, CrowdinFormat } from "./index.ts";
import { parseCatalog } from "./messages.ts";

export const crowdinFormats: readonly CrowdinFormat[] = [
  "react-intl",
  "chrome",
];

interface ChromeMessage {
  message: string;
  description?: string;
}

const isChromeMessage = (value: unknown): value is ChromeMessage =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as ChromeMessage).message === "string";

/**
 * Chrome JSON's `placeholders` block is left alone in both directions: our
 * messages use ICU placeholders in the text, which Crowdin handles from the
 * text itself.
 */
const parseChrome = (text: string, name: string): Catalog => {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (e) {
    throw new Error(`${name}: ${(e as Error).message}`, { cause: e });
  }
  if (typeof json !== "object" || json === null || Array.isArray(json)) {
    throw new Error(`${name}: expected an object of messages`);
  }
  const catalog: Catalog = {};
  for (const [id, value] of Object.entries(json)) {
    if (!isChromeMessage(value)) {
      throw new Error(`${name}: message ${id} has no message string`);
    }
    catalog[id] =
      typeof value.description === "string"
        ? { defaultMessage: value.message, description: value.description }
        : { defaultMessage: value.message };
  }
  return catalog;
};

const serializeChrome = (catalog: Catalog): string =>
  JSON.stringify(
    Object.fromEntries(
      Object.entries(catalog).map(([id, { defaultMessage, description }]) => [
        id,
        description === undefined
          ? { message: defaultMessage }
          : { message: defaultMessage, description },
      ]),
    ),
    null,
    2,
  ) + "\n";

/** A catalog as Crowdin holds it, read into the react-intl shape used locally. */
export const parseCrowdinCatalog = (
  text: string,
  format: CrowdinFormat,
  name: string,
): Catalog =>
  format === "chrome" ? parseChrome(text, name) : parseCatalog(text, name);

/**
 * The English source as Crowdin should hold it. A react-intl file is
 * uploaded byte for byte; only a Chrome JSON file is rewritten.
 */
export const toCrowdinFormat = (
  text: string,
  format: CrowdinFormat,
  name: string,
): string =>
  format === "chrome" ? serializeChrome(parseCatalog(text, name)) : text;
