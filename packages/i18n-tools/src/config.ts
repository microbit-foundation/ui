/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type {
  CatalogConfig,
  Config,
  CrowdinConfig,
  FileConfig,
} from "./index.ts";

export interface ResolvedCatalog {
  source: string;
  crowdinFile: string;
  translations: string;
  out?: string;
  packages: string[];
  local: string[];
  languages?: string[];
  afterDownload?: CatalogConfig["afterDownload"];
}

export interface ResolvedConfig {
  /** The directory holding the config file; all paths are relative to it. */
  root: string;
  crowdin: CrowdinConfig;
  languages: string[];
  catalogs: ResolvedCatalog[];
  files: FileConfig[];
}

export const configFileNames = ["i18n.config.mjs", "i18n.config.js"];

/**
 * Crowdin's in-context pseudo-language. Every string is "translated" to a
 * placeholder the in-context editor keys on, so nothing may be skipped on
 * download and the placeholders cannot be checked against English.
 */
export const inContextLanguage = "lol";

export class ConfigError extends Error {}

const findConfigFile = (root: string, explicit?: string): string => {
  if (explicit) {
    const file = path.resolve(root, explicit);
    if (!fs.existsSync(file)) {
      throw new ConfigError(`No config file at ${file}`);
    }
    return file;
  }
  for (const name of configFileNames) {
    const file = path.join(root, name);
    if (fs.existsSync(file)) {
      return file;
    }
  }
  throw new ConfigError(
    `No ${configFileNames.join(" or ")} in ${root}. Run from the repo root or pass --config.`,
  );
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((v) => typeof v === "string");

export const resolveCatalog = (catalog: CatalogConfig): ResolvedCatalog => {
  if (typeof catalog.source !== "string") {
    throw new ConfigError("Each catalog needs a `source` path");
  }
  let translations = catalog.translations;
  if (!translations) {
    if (!catalog.source.endsWith(".en.json")) {
      throw new ConfigError(
        `Catalog ${catalog.source}: pass \`translations\` when the source is not named *.en.json`,
      );
    }
    translations = catalog.source.replace(/\.en\.json$/, ".{lang}.json");
  }
  if (!translations.includes("{lang}") && !translations.includes("{Lang}")) {
    throw new ConfigError(
      `Catalog ${catalog.source}: \`translations\` must contain {lang} or {Lang}`,
    );
  }
  const local = catalog.local ?? [];
  if (local.some((l) => l.toLowerCase() === "en")) {
    throw new ConfigError(
      `Catalog ${catalog.source}: \`en\` is the source and cannot be a local locale`,
    );
  }
  return {
    source: catalog.source,
    crowdinFile: catalog.crowdinFile ?? path.basename(catalog.source),
    translations,
    out: catalog.out,
    packages: catalog.packages ?? [],
    local,
    languages: catalog.languages,
    afterDownload: catalog.afterDownload,
  };
};

export const resolveConfig = (
  config: unknown,
  root: string,
): ResolvedConfig => {
  if (!isRecord(config)) {
    throw new ConfigError("The config's default export must be an object");
  }
  const crowdin = config.crowdin;
  if (
    !isRecord(crowdin) ||
    (typeof crowdin.project !== "string" &&
      typeof crowdin.project !== "number") ||
    typeof crowdin.directory !== "string"
  ) {
    throw new ConfigError(
      "`crowdin` needs a `project` (identifier or id) and a `directory`",
    );
  }
  if (!isStringArray(config.languages)) {
    throw new ConfigError(
      "`languages` must be an array of Crowdin language ids",
    );
  }
  if (config.languages.some((l) => l.toLowerCase() === "en")) {
    throw new ConfigError("`languages` lists translations; leave out `en`");
  }
  const catalogs = (config.catalogs ?? []) as CatalogConfig[];
  const files = (config.files ?? []) as FileConfig[];
  for (const file of files) {
    if (
      typeof file.crowdinFile !== "string" ||
      typeof file.local !== "string"
    ) {
      throw new ConfigError("Each file needs `crowdinFile` and `local` paths");
    }
  }
  return {
    root,
    crowdin: crowdin as unknown as CrowdinConfig,
    languages: config.languages,
    catalogs: catalogs.map(resolveCatalog),
    files,
  };
};

export const loadConfig = async (
  root: string,
  explicit?: string,
): Promise<ResolvedConfig> => {
  const file = findConfigFile(root, explicit);
  const module = (await import(pathToFileURL(file).href)) as {
    default?: Config;
  };
  return resolveConfig(module.default, path.dirname(file));
};

/**
 * Expands `{lang}` (lowercase) and `{Lang}` (Crowdin's casing) in a path
 * template. Catalog files are lowercase by convention; MakeCode's `_locales`
 * directories keep Crowdin's casing.
 */
export const expandTemplate = (template: string, language: string): string =>
  template
    .replaceAll("{lang}", language.toLowerCase())
    .replaceAll("{Lang}", language);

export const translationPath = (
  catalog: ResolvedCatalog,
  language: string,
): string => expandTemplate(catalog.translations, language);

/** The Crowdin languages downloaded for a catalog. */
export const catalogLanguages = (
  config: ResolvedConfig,
  catalog: ResolvedCatalog,
): string[] => catalog.languages ?? config.languages;

/** Whether the catalog has a file in Crowdin at all. */
export const inCrowdin = (catalog: ResolvedCatalog): boolean =>
  catalog.languages === undefined || catalog.languages.length > 0;

/**
 * Every locale a catalog is compiled for: English, the hand-maintained
 * locales, then the Crowdin languages.
 */
export const catalogLocales = (
  config: ResolvedConfig,
  catalog: ResolvedCatalog,
): string[] => ["en", ...catalog.local, ...catalogLanguages(config, catalog)];

/**
 * Languages found on disk for a catalog that the config doesn't know about:
 * a language removed from the config, or one the app never listed.
 */
export const strayTranslationFiles = (
  config: ResolvedConfig,
  catalog: ResolvedCatalog,
): string[] => {
  const template = path.resolve(config.root, catalog.translations);
  const dir = path.dirname(template);
  if (!fs.existsSync(dir)) {
    return [];
  }
  const pattern = new RegExp(
    "^" +
      path
        .basename(template)
        .replace(/[.*+?^${}()|[\]\\]/g, (c) =>
          c === "{" || c === "}" ? c : `\\${c}`,
        )
        .replace(/\{lang\}|\{Lang\}/g, "([A-Za-z0-9-]+)") +
      "$",
  );
  const known = new Set(
    catalogLocales(config, catalog).map((l) => l.toLowerCase()),
  );
  return fs
    .readdirSync(dir)
    .filter((name) => {
      const match = pattern.exec(name);
      return match !== null && !known.has(match[1].toLowerCase());
    })
    .map((name) => path.relative(config.root, path.join(dir, name)));
};
