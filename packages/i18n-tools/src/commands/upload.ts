/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import fs from "node:fs";
import path from "node:path";
import { inCrowdin, type ResolvedConfig } from "../config.ts";
import { CrowdinProject, requireToken } from "../crowdin.ts";
import { parseCatalog } from "../messages.ts";
import type { Catalog } from "../index.ts";

export interface UploadOptions {
  /** Keep translations for strings whose English changed (typo fixes). */
  keepTranslations?: boolean;
  /** Show what would change in Crowdin without uploading. */
  dryRun?: boolean;
  /** Local source paths to upload; defaults to every catalog and file with a source. */
  only?: string[];
}

interface Target {
  source: string;
  crowdinFile: string;
}

export const uploadTargets = (config: ResolvedConfig): Target[] => [
  ...config.catalogs.filter(inCrowdin).map((c) => ({
    source: c.source,
    crowdinFile: c.crowdinFile,
  })),
  ...config.files
    .filter((f) => f.source && !f.crowdinFile.endsWith("/"))
    .map((f) => ({ source: f.source as string, crowdinFile: f.crowdinFile })),
];

export interface CatalogDiff {
  added: string[];
  removed: string[];
  changed: string[];
  descriptionOnly: string[];
}

export const diffCatalogs = (current: Catalog, next: Catalog): CatalogDiff => {
  const diff: CatalogDiff = {
    added: [],
    removed: [],
    changed: [],
    descriptionOnly: [],
  };
  for (const id of Object.keys(next).sort()) {
    if (!(id in current)) {
      diff.added.push(id);
    } else if (current[id].defaultMessage !== next[id].defaultMessage) {
      diff.changed.push(id);
    } else if (current[id].description !== next[id].description) {
      diff.descriptionOnly.push(id);
    }
  }
  for (const id of Object.keys(current).sort()) {
    if (!(id in next)) {
      diff.removed.push(id);
    }
  }
  return diff;
};

const isEmpty = (diff: CatalogDiff): boolean =>
  !diff.added.length &&
  !diff.removed.length &&
  !diff.changed.length &&
  !diff.descriptionOnly.length;

const describe = (label: string, ids: string[]): void => {
  if (ids.length) {
    console.log(`  ${label} (${ids.length}): ${ids.join(", ")}`);
  }
};

export const runUpload = async (
  config: ResolvedConfig,
  options: UploadOptions,
): Promise<number> => {
  let targets = uploadTargets(config);
  if (options.only?.length) {
    const wanted = new Set(options.only.map((p) => path.normalize(p)));
    targets = targets.filter((t) => wanted.has(path.normalize(t.source)));
    if (targets.length !== wanted.size) {
      throw new Error(
        `--only must name configured sources: ${uploadTargets(config)
          .map((t) => t.source)
          .join(", ")}`,
      );
    }
  }
  const project = await CrowdinProject.connect(config.crowdin, requireToken());
  const { directory } = config.crowdin;
  for (const target of targets) {
    const crowdinPath = `${directory}/${target.crowdinFile}`;
    const content = fs.readFileSync(
      path.resolve(config.root, target.source),
      "utf-8",
    );
    const existing = await project.findFile(crowdinPath);
    let note = "";
    if (!existing) {
      const parent = path.posix.dirname(crowdinPath);
      const hasDirectory =
        parent === "." || (await project.findDirectory(parent)) !== undefined;
      note = hasDirectory
        ? " (new file)"
        : ` (new file; creates directory ${parent})`;
    }
    console.log(`${target.source} -> ${crowdinPath}${note}`);
    if (existing) {
      const current = await project.downloadSource(existing);
      if (target.crowdinFile.endsWith(".json")) {
        const diff = diffCatalogs(
          parseCatalog(current, crowdinPath),
          parseCatalog(content, target.source),
        );
        if (isEmpty(diff)) {
          console.log("  unchanged; skipping");
          continue;
        }
        describe("added", diff.added);
        describe("removed", diff.removed);
        describe(
          options.keepTranslations
            ? "changed text, translations kept"
            : "changed text, translations cleared",
          diff.changed,
        );
        describe("changed description only", diff.descriptionOnly);
      } else if (current === content) {
        console.log("  unchanged; skipping");
        continue;
      } else {
        console.log("  content differs");
      }
    }
    if (options.dryRun) {
      console.log("  dry run; not uploaded");
      continue;
    }
    await project.uploadSource(crowdinPath, content, {
      keepTranslations: options.keepTranslations,
    });
    console.log("  uploaded");
  }
  return 0;
};
