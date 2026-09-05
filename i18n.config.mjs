import { defineConfig } from "@microbit/i18n-tools";

// Every locale any consuming app ships, so a string translated for one app is
// in place for the next. One list for all packages, deliberately: per-package
// lists drift. `en` is the hand-edited source and `en-US` a hand-maintained
// overrides file, so neither is a Crowdin language here. The `lol`
// pseudo-locale is Crowdin's in-context translation.
const languages = [
  "ar",
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

// These packages ship their lang/ files for apps to compile, so no `out`.
const packageCatalog = (name) => ({
  source: `packages/${name}/lang/ui.en.json`,
  crowdinFile: `${name}/ui.en.json`,
  local: ["en-US"],
});

export default defineConfig({
  crowdin: {
    project: "microbitorg",
    branch: "new",
    directory: "packages",
  },
  languages,
  catalogs: [
    packageCatalog("ui"),
    packageCatalog("ui-carousel"),
    packageCatalog("ui-patterns"),
  ],
});
