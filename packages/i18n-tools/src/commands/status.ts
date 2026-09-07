/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { configuredLanguages, type ResolvedConfig } from "../config.ts";
import type { TranslationStatusModel } from "@crowdin/crowdin-api-client";
import { CrowdinProject, describeError, requireToken } from "../crowdin.ts";
import { uploadTargets } from "./upload.ts";

const pad = (value: string | number, width: number): string =>
  String(value).padStart(width);

/**
 * Translation and approval progress per language for this repo's files, with
 * the configured languages marked, so a language that has crossed the line
 * without being configured stands out.
 */
export const runStatus = async (config: ResolvedConfig): Promise<number> => {
  const project = await CrowdinProject.connect(config.crowdin, requireToken());
  const configured = new Set(
    configuredLanguages(config).map((l) => l.toLowerCase()),
  );
  let failures = 0;
  for (const target of uploadTargets(config)) {
    const crowdinPath = `${config.crowdin.directory}/${target.crowdinFile}`;
    let progress: TranslationStatusModel.LanguageProgress[];
    try {
      const file = await project.requireFile(crowdinPath);
      progress = await project.fileProgress(file);
    } catch (e) {
      failures++;
      console.error(`\n${crowdinPath}: ${describeError(e)}`);
      continue;
    }
    progress.sort(
      (a, b) =>
        b.translationProgress - a.translationProgress ||
        a.languageId.localeCompare(b.languageId),
    );
    console.log(`\n${crowdinPath}`);
    console.log(
      `  ${"language".padEnd(10)} ${pad("translated", 10)} ${pad("approved", 8)} ${pad("strings", 9)}`,
    );
    for (const p of progress) {
      const marker = configured.has(p.languageId.toLowerCase()) ? "*" : " ";
      console.log(
        `${marker} ${p.languageId.padEnd(10)} ${pad(`${p.translationProgress}%`, 10)} ${pad(`${p.approvalProgress}%`, 8)} ${pad(`${p.phrases.translated}/${p.phrases.total}`, 9)}`,
      );
    }
  }
  console.log("\n* configured in i18n.config");
  return failures ? 1 : 0;
};
