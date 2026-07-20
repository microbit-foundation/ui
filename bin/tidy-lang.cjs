/**
 * Tidies the source `lang/*.json` catalogs of every translated package (see
 * bin/i18n-packages.cjs): backfills missing keys from English (so a locale
 * not yet round-tripped through Crowdin still renders), drops keys no longer
 * in English, and sorts keys so it doesn't matter where new ones are added.
 * Also best-effort validates that ICU variables match between English and
 * each translation, exiting non-zero if any differ. Run before compiling.
 */
const fs = require("node:fs");
const path = require("node:path");
const packages = require("./i18n-packages.cjs");

const variableRegExp = /({[a-zA-Z0-9]+})/g;

// Best-effort check that variables haven't been changed in translation.
const areTranslationsValid = (file, enJson, translatedJson) => {
  let valid = true;
  for (const k of Object.keys(enJson)) {
    const en = enJson[k].defaultMessage;
    const translated = translatedJson[k].defaultMessage;
    if (en.match(/, plural/)) {
      // Skip ICU strings as we don't understand them.
      continue;
    }
    const variablesEn = new Set(en.match(variableRegExp) ?? []);
    const variablesTranslated = new Set(translated.match(variableRegExp) ?? []);
    const areSetsEqual = (a, b) =>
      a.size === b.size && Array.from(a).every((value) => b.has(value));
    if (!areSetsEqual(variablesEn, variablesTranslated)) {
      if (valid) {
        console.error(file);
        valid = false;
      }
      console.error(`  ${en}`);
      console.error(`  ${translated}`);
      console.error(`  Differing variables!`);
      console.error();
    }
  }
  return valid;
};

const tidyFile = (langDir, messages) => {
  const file = path.join(langDir, messages);
  const enFile = file.replace(/\.[a-z-]+\.json/, ".en.json");
  const en = JSON.parse(fs.readFileSync(enFile));
  const validKeys = new Set(Object.keys(en));
  const data = {
    // Fall back to English even if we haven't round-tripped via Crowdin yet.
    ...en,
    ...JSON.parse(fs.readFileSync(file)),
  };
  for (const k of Object.keys(data)) {
    if (!validKeys.has(k)) {
      delete data[k];
    }
  }
  const result = Object.create(null);
  for (const k of Object.keys(data).sort()) {
    result[k] = data[k];
  }
  fs.writeFileSync(file, JSON.stringify(result, null, 2) + "\n");
  return areTranslationsValid(file, en, result);
};

let valid = true;
for (const pkg of packages) {
  const langDir = path.join(pkg.dir, "lang");
  for (const messages of fs
    .readdirSync(langDir)
    .filter((f) => f.endsWith(".json"))) {
    valid = tidyFile(langDir, messages) && valid;
  }
}

const okExitStatus = 0;
const seriousTroubleExitStatus = 2;
process.exit(valid ? okExitStatus : seriousTroubleExitStatus);
