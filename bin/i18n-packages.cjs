/**
 * Packages with translated message catalogs. Consumed by
 * bin/tidy-lang.cjs and bin/update-translations.cjs so adding a package here
 * brings it into both. Each package ships its source `lang/ui.<locale>.json`
 * files; consuming apps compile them into their own per-locale catalogs.
 *
 * `en` is the hand-edited source and `en-US` is maintained manually, so
 * `languages` lists only the locales pulled from Crowdin.
 */
module.exports = [
  {
    dir: "packages/ui-patterns",
    crowdinDir: "new/packages/microbit-ui-patterns",
    // Mirrors packages/ui: every locale any consuming app ships.
    languages: [
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
    ],
  },
  {
    // Package directory, relative to the repo root.
    dir: "packages/ui",
    // Where this package's strings sit within each language's Crowdin export
    // dir.
    crowdinDir: "new/packages/microbit-ui",
    // Every locale any consuming app ships, so a string translated for one
    // app is there for the next. The `lol` pseudo-locale sorts last.
    languages: [
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
    ],
  },
];
