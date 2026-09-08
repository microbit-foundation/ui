/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import fs from "node:fs";
import path from "node:path";
import { inCrowdin, type ResolvedConfig } from "../config.ts";
import { CrowdinProject, requireToken } from "../crowdin.ts";
import { parseCrowdinCatalog, toCrowdinFormat } from "../formats.ts";
import { parseCatalog } from "../messages.ts";
import type { Catalog, CrowdinFormat, FileConfig } from "../index.ts";

export interface UploadOptions {
  /** Keep translations for strings whose English changed (typo fixes). */
  keepTranslations?: boolean;
  /** Show what would change in Crowdin without uploading. */
  dryRun?: boolean;
  /**
   * Local source paths to upload, a trailing slash selecting everything under
   * a directory; defaults to every catalog and file with a source.
   */
  only?: string[];
}

export interface Target {
  source: string;
  crowdinFile: string;
  /**
   * A catalog, whose changes can be described id by id, and the format it
   * takes in Crowdin. Absent for an opaque file.
   */
  catalog?: CrowdinFormat;
  /** An opaque file's name for its hook: its path within a directory entry. */
  name?: string;
  beforeUpload?: FileConfig["beforeUpload"];
}

/**
 * Every file under a directory as sorted posix paths relative to it, dotfiles
 * left out.
 */
const listSourceFiles = (dir: string): string[] => {
  const result: string[] = [];
  const walk = (relative: string) => {
    const entries = fs.readdirSync(path.join(dir, relative), {
      withFileTypes: true,
    });
    for (const entry of entries) {
      if (entry.name.startsWith(".")) {
        continue;
      }
      const name = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walk(name);
      } else if (entry.isFile()) {
        result.push(name);
      }
    }
  };
  walk("");
  return result.sort();
};

const fileTargets = (config: ResolvedConfig, entry: FileConfig): Target[] => {
  if (!entry.source) {
    return [];
  }
  const { beforeUpload } = entry;
  if (!entry.crowdinFile.endsWith("/")) {
    return [
      {
        source: entry.source,
        crowdinFile: entry.crowdinFile,
        name: path.posix.basename(entry.crowdinFile),
        beforeUpload,
      },
    ];
  }
  const dir = path.resolve(config.root, entry.source);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    throw new Error(
      `${entry.source} is not a directory; the source of ${entry.crowdinFile} must be one`,
    );
  }
  const prefix = entry.source.replace(/\/+$/, "");
  return listSourceFiles(dir).map((name) => ({
    source: `${prefix}/${name}`,
    crowdinFile: `${entry.crowdinFile}${name}`,
    name,
    beforeUpload,
  }));
};

export const uploadTargets = (config: ResolvedConfig): Target[] => [
  ...config.catalogs.filter(inCrowdin).map((c) => ({
    source: c.source,
    crowdinFile: c.crowdinFile,
    catalog: c.crowdinFormat,
  })),
  ...config.files.flatMap((f) => fileTargets(config, f)),
];

/** The English as Crowdin should hold it: converted for a catalog, rewritten by its hook for a file. */
export const uploadContent = (target: Target, local: string): string => {
  if (target.catalog) {
    return toCrowdinFormat(local, target.catalog, target.source);
  }
  return target.beforeUpload
    ? target.beforeUpload(local, { name: target.name ?? target.source })
    : local;
};

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
  const only = options.only ?? [];
  if (only.length) {
    const matches = (wanted: string, source: string) =>
      wanted.endsWith(path.sep) ? source.startsWith(wanted) : wanted === source;
    const unmatched = only.filter(
      (p) =>
        !targets.some((t) =>
          matches(path.normalize(p), path.normalize(t.source)),
        ),
    );
    if (unmatched.length) {
      throw new Error(
        `--only ${unmatched[0]} matches no configured source: ${targets
          .map((t) => t.source)
          .join(", ")}`,
      );
    }
    targets = targets.filter((t) =>
      only.some((p) => matches(path.normalize(p), path.normalize(t.source))),
    );
  }
  const project = await CrowdinProject.connect(config.crowdin, requireToken());
  const { directory } = config.crowdin;
  for (const target of targets) {
    const crowdinPath = `${directory}/${target.crowdinFile}`;
    const local = fs.readFileSync(
      path.resolve(config.root, target.source),
      "utf-8",
    );
    const content = uploadContent(target, local);
    const existing = await project.findFile(crowdinPath);
    const notes: string[] = [];
    if (target.catalog === "chrome") {
      notes.push("as Chrome JSON");
    }
    if (!existing) {
      const parent = path.posix.dirname(crowdinPath);
      const hasDirectory =
        parent === "." || (await project.findDirectory(parent)) !== undefined;
      notes.push(
        hasDirectory ? "new file" : `new file; creates directory ${parent}`,
      );
    }
    const note = notes.length ? ` (${notes.join("; ")})` : "";
    console.log(`${target.source} -> ${crowdinPath}${note}`);
    if (existing) {
      const current = await project.downloadSource(existing);
      if (target.catalog) {
        const diff = diffCatalogs(
          parseCrowdinCatalog(current, target.catalog, crowdinPath),
          parseCatalog(local, target.source),
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
