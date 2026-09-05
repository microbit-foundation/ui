/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { ResolvedConfig } from "../config.ts";
import { CrowdinProject, requireToken } from "../crowdin.ts";
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
  const configured = new Set(config.languages.map((l) => l.toLowerCase()));
  for (const target of uploadTargets(config)) {
    const crowdinPath = `${config.crowdin.directory}/${target.crowdinFile}`;
    const file = await project.requireFile(crowdinPath);
    const progress = await project.fileProgress(file);
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
  return 0;
};
