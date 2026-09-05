/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

/**
 * One react-intl message: the shape of `lang/*.json` entries.
 */
export interface MessageDescriptor {
  defaultMessage: string;
  /** Context for translators; kept in the English source only. */
  description?: string;
}

export type Catalog = Record<string, MessageDescriptor>;

export interface CrowdinConfig {
  /** Project identifier (the slug in Crowdin URLs) or numeric id. */
  project: string | number;
  /** Branch holding the files, if the project uses branches. */
  branch?: string;
  /** Directory within the branch (or project) holding this repo's files. */
  directory: string;
}

export interface AfterDownloadContext {
  /** Crowdin language id, in Crowdin's casing (e.g. `pt-BR`). */
  language: string;
  /** The downloaded translations, before tidying. */
  messages: Catalog;
  /**
   * Download another file's translation for the same language. The path is
   * relative to the Crowdin branch (or project) root, not this repo's
   * directory. Parsed as JSON when the name ends in `.json`, otherwise text.
   */
  download: (crowdinPath: string) => Promise<unknown>;
}

/**
 * A react-intl message catalog: an English source file plus one translated
 * file per language.
 */
export interface CatalogConfig {
  /** The English source, e.g. `lang/ui.en.json`. */
  source: string;
  /**
   * Name of the file in Crowdin, within `crowdin.directory`. Defaults to the
   * source file's name.
   */
  crowdinFile?: string;
  /**
   * Template for the translated files, `{lang}` being the language id in
   * Crowdin's canonical casing (`pt-BR`) and `{lang:lower}` its lowercase
   * form. Defaults to the source path with `.en.json` replaced by
   * `.{lang}.json`.
   */
  translations?: string;
  /**
   * Template for the compiled per-locale catalogs the app loads, e.g.
   * `src/messages/ui.{lang}.json`. Omit for a package that ships its `lang/`
   * files for apps to compile.
   */
  out?: string;
  /**
   * Packages whose `lang/ui.<lang>.json` catalogs are merged into the
   * compiled output, e.g. `@microbit/ui`. Their message ids must not collide
   * with the app's.
   */
  packages?: string[];
  /**
   * Locales maintained by hand rather than in Crowdin, e.g. `en-US`. Their
   * files hold only the messages that differ from English.
   */
  local?: string[];
  /**
   * Crowdin languages for this catalog when they differ from the config's
   * `languages`. An empty list means the catalog is never synced: it is not
   * in Crowdin, or translation of it is disabled there.
   */
  languages?: string[];
  /** Adjust a language's translations after download, before tidying. */
  afterDownload?: (context: AfterDownloadContext) => Catalog | Promise<Catalog>;
}

/**
 * Any other translated file, copied as-is: MakeCode `_locales` strings,
 * pyright's message JSON, a directory of Markdown docs.
 */
export interface FileConfig {
  /**
   * Path within `crowdin.directory`. A trailing slash names a directory,
   * downloaded whole.
   */
  crowdinFile: string;
  /** Template for the local copy, expanded as for `translations`. */
  local: string;
  /** The local English source to upload, if this tool uploads it. */
  source?: string;
}

export interface Config {
  crowdin: CrowdinConfig;
  /**
   * Crowdin language ids to download, in Crowdin's casing. Adding a language
   * here is the deliberate step that brings it into the repo.
   */
  languages: string[];
  catalogs?: CatalogConfig[];
  files?: FileConfig[];
}

/** Identity function giving `i18n.config.mjs` a typed default export. */
export const defineConfig = (config: Config): Config => config;
