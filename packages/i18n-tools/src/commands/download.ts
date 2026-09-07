/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { SourceFilesModel } from "@crowdin/crowdin-api-client";
import fs from "node:fs";
import path from "node:path";
import {
  catalogLanguages,
  configuredLanguages,
  expandTemplate,
  inContextLanguage,
  inCrowdin,
  translationPath,
  type ResolvedConfig,
} from "../config.ts";
import { CrowdinProject, describeError, requireToken } from "../crowdin.ts";
import {
  dropInvalidTranslations,
  formatIssues,
  parseCatalog,
  readCatalog,
  tidyTranslation,
  writeCatalog,
  type Issue,
} from "../messages.ts";

export interface DownloadOptions {
  /** Crowdin language ids; defaults to every configured language. */
  languages?: string[];
  approvedOnly?: boolean;
}

/**
 * Narrows a catalog's or the config's languages to those asked for on the
 * command line, or returns them all when none were.
 */
const languageFilter = (
  config: ResolvedConfig,
  requested?: string[],
): ((languages: string[]) => string[]) => {
  if (!requested?.length) {
    return (languages) => languages;
  }
  const all = configuredLanguages(config);
  const known = new Map(all.map((l) => [l.toLowerCase(), l]));
  const selected = new Set(
    requested.map((r) => {
      const language = known.get(r.toLowerCase());
      if (!language) {
        throw new Error(
          `${r} is not a configured language (${all.join(", ")})`,
        );
      }
      return language;
    }),
  );
  return (languages) => languages.filter((l) => selected.has(l));
};

const writeBytes = (file: string, data: Uint8Array): void => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
};

export const runDownload = async (
  config: ResolvedConfig,
  options: DownloadOptions,
): Promise<number> => {
  const select = languageFilter(config, options.languages);
  const project = await CrowdinProject.connect(config.crowdin, requireToken());
  const { directory } = config.crowdin;
  const dropped: Issue[] = [];
  let failures = 0;

  const downloadOther = async (language: string, crowdinPath: string) => {
    const file = await project.requireFile(crowdinPath);
    const text = await project.downloadTranslation(file, language, {
      approvedOnly: options.approvedOnly,
      skipUntranslated: language !== inContextLanguage,
    });
    return crowdinPath.endsWith(".json") ? (JSON.parse(text) as unknown) : text;
  };

  for (const catalog of config.catalogs.filter(inCrowdin)) {
    const crowdinPath = `${directory}/${catalog.crowdinFile}`;
    let file: SourceFilesModel.File;
    try {
      file = await project.requireFile(crowdinPath);
    } catch (e) {
      // A catalog not yet uploaded should not stop the others downloading.
      failures++;
      console.error(`${crowdinPath}: ${describeError(e)}`);
      continue;
    }
    const english = readCatalog(path.resolve(config.root, catalog.source));
    for (const language of select(catalogLanguages(config, catalog))) {
      const relative = translationPath(catalog, language);
      try {
        const text = await project.downloadTranslation(file, language, {
          approvedOnly: options.approvedOnly,
          skipUntranslated: language !== inContextLanguage,
        });
        let messages = parseCatalog(text, `${crowdinPath} (${language})`);
        if (catalog.afterDownload) {
          messages = await catalog.afterDownload({
            language,
            messages,
            download: (p) => downloadOther(language, p),
          });
        }
        const tidied = tidyTranslation(english, messages);
        if (language !== inContextLanguage) {
          dropped.push(...dropInvalidTranslations(relative, english, tidied));
        }
        writeCatalog(path.resolve(config.root, relative), tidied);
        console.log(
          `${relative}: ${Object.keys(tidied).length}/${Object.keys(english).length} messages`,
        );
      } catch (e) {
        failures++;
        console.error(`${relative}: ${describeError(e)}`);
      }
    }
  }

  for (const entry of config.files) {
    const crowdinPath = `${directory}/${entry.crowdinFile}`;
    for (const language of select(config.languages)) {
      const local = path.resolve(
        config.root,
        expandTemplate(entry.local, language),
      );
      try {
        if (entry.crowdinFile.endsWith("/")) {
          const dir = await project.requireDirectory(crowdinPath);
          const contents = await project.downloadDirectoryTranslation(
            dir,
            language,
            {
              approvedOnly: options.approvedOnly,
              skipUntranslated: language !== inContextLanguage,
            },
          );
          for (const [name, data] of contents) {
            writeBytes(path.join(local, name), data);
          }
          console.log(
            `${path.relative(config.root, local)}/: ${contents.size} files`,
          );
        } else {
          const file = await project.requireFile(crowdinPath);
          const text = await project.downloadTranslation(file, language, {
            approvedOnly: options.approvedOnly,
            skipUntranslated: language !== inContextLanguage,
          });
          writeBytes(local, new TextEncoder().encode(text));
          console.log(path.relative(config.root, local));
        }
      } catch (e) {
        failures++;
        console.error(
          `${path.relative(config.root, local)}: ${describeError(e)}`,
        );
      }
    }
  }

  if (dropped.length) {
    console.warn(
      `\nDropped ${dropped.length} translation(s) whose placeholders do not match English; fix them in Crowdin:`,
    );
    console.warn(formatIssues(dropped));
  }
  if (failures) {
    console.error(`${failures} download(s) failed`);
    return 1;
  }
  return 0;
};
