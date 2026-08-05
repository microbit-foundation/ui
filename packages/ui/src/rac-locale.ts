/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

/**
 * Sanitizes one of our locale ids for react-aria's I18nProvider.
 *
 * No mapping is needed to reach react-aria's own strings: its fallback chain
 * runs exact tag, then the bare language, then any variant of that language,
 * then en-US — so `fr` finds fr-FR, `ja` finds ja-JP, and the locales it has no
 * strings for at all (ca, cy, ga-IE, and our `lol` pseudo-locale) land on
 * English.
 *
 * What does need handling is a malformed tag: I18nProvider's explicit-locale
 * path feeds it straight to `new Intl.Locale` with no guard of its own (unlike
 * its browser-locale path), so a bad tag throws during render and takes out the
 * tree. Only reachable through SharedUIProvider's `locale` prop in practice —
 * react-intl rejects a malformed locale before we could read it from context.
 */
export const racLocale = (locale: string | undefined): string | undefined => {
  if (locale === undefined) {
    // Leave react-aria on its browser-locale default.
    return undefined;
  }
  try {
    Intl.DateTimeFormat.supportedLocalesOf([locale]);
  } catch {
    return "en-GB";
  }
  return locale;
};
