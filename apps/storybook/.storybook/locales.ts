/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { languages } from "@microbit/ui-patterns";

/**
 * The packages' source catalogs, keyed by module path. Extracted format
 * (`{id: {defaultMessage, description}}`) rather than the compiled catalogs an
 * app would build, so this harness reads the files in the repo and no build
 * step sits between editing a translation and seeing it.
 *
 * The packages are globbed into one catalog per locale: the ids are
 * namespaced (`ui.` / `ui-patterns.` / `ui-carousel.`) so they cannot
 * collide.
 */
const catalogs = import.meta.glob<
  Record<string, { defaultMessage: string; description: string }>
>("../../../packages/{carousel,ui,ui-patterns}/lang/*.json", {
  eager: true,
  import: "default",
});

/** `packages/ui/lang/ui.pt-br.json` → `pt-br`. */
const localeFromPath = (path: string): string =>
  path.replace(/^.*\/ui\.(.+)\.json$/, "$1");

// The catalog filenames are lower-cased; the name-book's ids are the canonical
// BCP 47 casing, which is what react-intl and react-aria should be given.
const canonicalIds = new Map(languages.map((l) => [l.id.toLowerCase(), l.id]));

const messagesByLocale = new Map<string, Record<string, string>>();
for (const [path, catalog] of Object.entries(catalogs)) {
  const id = localeFromPath(path);
  const merged = messagesByLocale.get(id) ?? {};
  for (const [messageId, message] of Object.entries(catalog)) {
    merged[messageId] = message.defaultMessage;
  }
  messagesByLocale.set(id, merged);
}

export interface StorybookLocale {
  /** Canonical BCP 47 tag, for the providers. */
  id: string;
  /** Toolbar label. */
  title: string;
  messages: Record<string, string>;
}

export const locales: StorybookLocale[] = [...messagesByLocale]
  .map(([fileId, messages]) => {
    const id = canonicalIds.get(fileId) ?? fileId;
    // `lol` is a pseudo-locale, not a language anyone speaks, so it is not in
    // the name-book.
    const name = languages.find((l) => l.id === id)?.enName;
    return { id, title: name ? `${name} (${id})` : id, messages };
  })
  .sort((a, b) => a.title.localeCompare(b.title, "en"));

export const defaultLocale = "en";

// Cannot miss: `en` is the hand-edited source every package's catalogs are
// generated from, so its file is always there.
const english = locales.find((l) => l.id === defaultLocale) as StorybookLocale;

/** The toolbar's pick, or English if the global holds something unknown. */
export const localeOrDefault = (id: unknown): StorybookLocale =>
  locales.find((l) => l.id === id) ?? english;
