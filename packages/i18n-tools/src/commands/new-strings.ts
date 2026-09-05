/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { execFileSync } from "node:child_process";
import path from "node:path";
import type { ResolvedConfig } from "../config.ts";
import { countWords } from "../icu.ts";
import { parseCatalog, readCatalog } from "../messages.ts";
import type { Catalog } from "../index.ts";

export interface NewStringsOptions {
  /** Git ref to compare the working tree against. */
  base?: string;
}

const catalogAt = (root: string, ref: string, file: string): Catalog => {
  let text: string;
  try {
    text = execFileSync("git", ["show", `${ref}:${file}`], {
      cwd: root,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    // Not in the base ref: every message is new.
    return {};
  }
  return parseCatalog(text, `${ref}:${file}`);
};

/**
 * English copy in the working tree that the base ref doesn't have, with a
 * Crowdin-style word count. Matches on text, not id, so renaming an id or
 * editing a description doesn't count as new translation work.
 */
export const runNewStrings = (
  config: ResolvedConfig,
  { base = "main" }: NewStringsOptions,
): number => {
  let totalMessages = 0;
  let totalWords = 0;
  for (const catalog of config.catalogs) {
    const current = readCatalog(path.resolve(config.root, catalog.source));
    const baseline = new Set(
      Object.values(catalogAt(config.root, base, catalog.source)).map(
        (m) => m.defaultMessage,
      ),
    );
    const fresh = Object.values(current)
      .map((m) => m.defaultMessage)
      .filter((text) => !baseline.has(text));
    if (!fresh.length) {
      continue;
    }
    console.log(`${catalog.source} (since ${base}):`);
    for (const text of fresh) {
      console.log(`  ${text}`);
      totalWords += countWords(text);
    }
    totalMessages += fresh.length;
  }
  if (totalMessages === 0) {
    console.log(`No new translation copy since ${base}.`);
  } else {
    console.log(`\n${totalMessages} new messages, ${totalWords} words`);
  }
  return 0;
};
