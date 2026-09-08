/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Issue } from "./messages.ts";

export interface DownloadSummary {
  /** Files written, relative to the config root. */
  written: string[];
  /** Files that failed, with the error text. */
  failed: { file: string; error: string }[];
  /** Translations left out because their placeholders differ from English. */
  dropped: Issue[];
}

/**
 * A code span, fenced with more backticks than any run inside it: a
 * backslash does not escape inside a span.
 */
const code = (text: string): string => {
  const longest = Math.max(
    0,
    ...[...text.matchAll(/`+/g)].map((m) => m[0].length),
  );
  const fence = "`".repeat(longest + 1);
  const pad = longest ? " " : "";
  return `${fence}${pad}${text}${pad}${fence}`;
};

/**
 * Prose that names placeholders and tags, which would otherwise be read as
 * HTML (`<li>`) or emphasis.
 */
const escape = (text: string): string =>
  text.replace(/[\\`*_<>[\]]/g, (c) => `\\${c}`);

/**
 * A Markdown account of a download for a pull request body or a GitHub step
 * summary: what was written, what failed, and which translations were left
 * out and why, so the deletions in the diff are explained where the
 * reviewer reads.
 */
export const formatSummary = ({
  written,
  failed,
  dropped,
}: DownloadSummary): string => {
  const lines: string[] = ["## Translation sync", ""];
  const count = (n: number, noun: string) =>
    `${n} ${noun}${n === 1 ? "" : "s"}`;
  lines.push(
    failed.length
      ? `Downloaded ${count(written.length, "file")}; ${count(failed.length, "download")} failed.`
      : `Downloaded ${count(written.length, "file")}.`,
  );
  if (failed.length) {
    lines.push("", `### Failed downloads (${failed.length})`, "");
    for (const f of failed) {
      lines.push(`- ${code(f.file)}: ${escape(f.error)}`);
    }
  }
  if (dropped.length) {
    lines.push(
      "",
      `### Translations left out (${dropped.length})`,
      "",
      "Their placeholders differ from the English message, so English shows in their place until they are fixed in Crowdin.",
      "",
    );
    for (const d of dropped) {
      lines.push(`- ${code(d.file)} ${code(d.id)}: ${escape(d.message)}`);
      if (d.english !== undefined) {
        lines.push(`  - en: ${code(d.english)}`);
        lines.push(`  - translated: ${code(d.translation ?? "")}`);
      }
    }
  }
  return lines.join("\n") + "\n";
};
