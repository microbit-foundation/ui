/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import fs from "node:fs";
import path from "node:path";
import {
  expandTemplate,
  inContextLanguage,
  translationPath,
  type ResolvedConfig,
} from "../config.ts";
import { CrowdinProject, describeError, requireToken } from "../crowdin.ts";
import {
  formatIssues,
  parseCatalog,
  readCatalog,
  tidyTranslation,
  validateTranslation,
  writeCatalog,
  type Issue,
} from "../messages.ts";

export interface DownloadOptions {
  /** Crowdin language ids; defaults to every configured language. */
  languages?: string[];
  approvedOnly?: boolean;
}

const selectLanguages = (
  config: ResolvedConfig,
  requested?: string[],
): string[] => {
  if (!requested?.length) {
    return config.languages;
  }
  const known = new Map(config.languages.map((l) => [l.toLowerCase(), l]));
  return requested.map((r) => {
    const language = known.get(r.toLowerCase());
    if (!language) {
      throw new Error(
        `${r} is not a configured language (${config.languages.join(", ")})`,
      );
    }
    return language;
  });
};

const writeBytes = (file: string, data: Uint8Array): void => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
};

export const runDownload = async (
  config: ResolvedConfig,
  options: DownloadOptions,
): Promise<number> => {
  const languages = selectLanguages(config, options.languages);
  const project = await CrowdinProject.connect(config.crowdin, requireToken());
  const { directory } = config.crowdin;
  const issues: Issue[] = [];
  let failures = 0;

  const downloadOther = async (language: string, crowdinPath: string) => {
    const file = await project.requireFile(crowdinPath);
    const text = await project.downloadTranslation(file, language, {
      approvedOnly: options.approvedOnly,
      skipUntranslated: language !== inContextLanguage,
    });
    return crowdinPath.endsWith(".json") ? (JSON.parse(text) as unknown) : text;
  };

  for (const catalog of config.catalogs) {
    const crowdinPath = `${directory}/${catalog.crowdinFile}`;
    const file = await project.requireFile(crowdinPath);
    const english = readCatalog(path.resolve(config.root, catalog.source));
    for (const language of languages) {
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
          issues.push(...validateTranslation(relative, english, tidied));
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
    for (const language of languages) {
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

  if (issues.length) {
    console.error(formatIssues(issues));
  }
  if (failures) {
    console.error(`${failures} download(s) failed`);
    return 1;
  }
  return issues.length ? 2 : 0;
};
