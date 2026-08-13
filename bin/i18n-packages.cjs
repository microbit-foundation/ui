/**
 * Packages with translated message catalogs. Consumed by
 * bin/tidy-lang.cjs and bin/update-translations.cjs so adding a package here
 * brings it into both. Each package ships its source `lang/ui.<locale>.json`
 * files; consuming apps compile them into their own per-locale catalogs.
 *
 * `en` is the hand-edited source and `en-US` is maintained manually, so
 * `languages` lists only the locales pulled from Crowdin.
 */

// One list for every package, deliberately: a locale added for one package
// applies to all of them, even if the others ship English backfill until
// their strings are translated. The alternative — per-package lists — drifts.
// Every locale any consuming app ships, so a string translated for one app is
// there for the next. The `lol` pseudo-locale sorts last.
const languages = [
  "ca",
  "cy",
  "de",
  "es-ES",
  "fr",
  "ga-IE",
  "it",
  "ja",
  "ko",
  "lo",
  "nl",
  "pl",
  "pt-BR",
  "vi",
  "zh-CN",
  "zh-TW",
  "lol",
];

module.exports = [
  {
    // Package directory, relative to the repo root.
    dir: "packages/ui-patterns",
    // Where this package's strings sit within each language's Crowdin export
    // dir.
    crowdinDir: "new/packages/microbit-ui-patterns",
    languages,
  },
  {
    dir: "packages/ui",
    crowdinDir: "new/packages/microbit-ui",
    languages,
  },
];
