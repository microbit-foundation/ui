/**
 * Update translated message catalogs from an extracted Crowdin export.
 *
 * Pass the path to the extracted Crowdin ZIP. For each configured package and
 * language it copies the translated `ui.en.json` out of the export into the
 * package's `lang/ui.<lang>.json`, then you run `npm run i18n:compile` to
 * regenerate the committed AST bundles.
 *
 * Lives at the repo root and is driven by the shared `bin/i18n-packages.cjs`
 * table so it acts on every translated package at once.
 *
 * `en` is the hand-edited source of truth and `en-US` is maintained manually
 * (see the package README), so neither is in a package's `languages` list.
 */
const fs = require("node:fs");
const path = require("node:path");
const packages = require("./i18n-packages.cjs");

const okExitStatus = 0;
const errExitStatus = 2;

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
