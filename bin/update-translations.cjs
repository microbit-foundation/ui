/**
 * Update translated message catalogs from an extracted Crowdin export.
 *
 * Pass the path to the extracted Crowdin ZIP. For each configured package and
 * language it copies the translated `ui.en.json` out of the export into the
 * package's `lang/ui.<lang>.json`, then you run `npm run i18n:compile` to
 * regenerate the committed AST bundles.
 *
 * Lives at the repo root and is driven by the `packages` table below so it can
 * act on every translated package at once — add a package by giving it a
 * `dir`, the `crowdinDir` its strings sit under in the export, and the
 * languages to pull.
 *
 * `en` is the hand-edited source of truth and `en-US` is maintained manually
 * (see the package README), so neither is pulled from Crowdin.
 */
const fs = require("node:fs");
const path = require("node:path");

const okExitStatus = 0;
const errExitStatus = 2;

// Adding a new language? Add it here, then re-run once Crowdin has it.
const languages = [
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
];

const packages = [
  {
    // Package directory, relative to the repo root.
    dir: "packages/ui",
    // Where this package's strings sit within each language's export dir.
    // Placeholder until the Crowdin project is wired up — update to match the
    // real export layout then.
    crowdinDir: "new/packages/microbit-ui",
    languages,
  },
];

const readJSON = (filepath) => JSON.parse(fs.readFileSync(filepath));

const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error("Error: pass the path to the extracted Crowdin ZIP");
  process.exit(errExitStatus);
}
const prefix = args[0];

for (const pkg of packages) {
  for (const language of pkg.languages) {
    const lowerLang = language.toLowerCase();
    const srcFilepath = path.join(
      prefix,
      lowerLang,
      pkg.crowdinDir,
      "ui.en.json",
    );
    const outFilepath = path.join(pkg.dir, "lang", `ui.${lowerLang}.json`);
    const messages = readJSON(srcFilepath);
    fs.writeFileSync(outFilepath, JSON.stringify(messages, null, 2) + "\n");
    console.log("wrote", outFilepath);
  }
}

console.log("\nNow run `npm run i18n:compile` to regenerate the AST bundles.");
process.exit(okExitStatus);
