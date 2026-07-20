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
    // Package directory, relative to the repo root.
    dir: "packages/ui",
    // Where this package's strings sit within each language's Crowdin export
    // dir. Placeholder until the Crowdin project is wired up.
    crowdinDir: "new/packages/microbit-ui",
    languages: [
      "ca",
      "es-ES",
      "fr",
      "ja",
      "ko",
      "nl",
      "pl",
      "pt-BR",
      "zh-TW",
      "lol",
    ],
  },
];
