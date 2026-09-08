/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { diff } from "node:util";

interface Entry {
  mark: " " | "-" | "+";
  text: string;
}

/**
 * A file as lines, each keeping its newline. Only the last line can lack
 * one, which makes it a different line from the same text with a newline,
 * as `diff` sees it.
 */
const toLines = (text: string): string[] =>
  text.match(/[^\n]*\n|[^\n]+$/g) ?? [];

/** One side of a hunk header, in the format's abbreviated forms. */
const range = (start: number, count: number): string =>
  count === 1 ? `${start}` : `${count === 0 ? start - 1 : start},${count}`;

/**
 * A unified diff from `before` to `after`, `context` unchanged lines around
 * each change, for showing what an upload would change in a file that has
 * no ids to diff by. Empty when the texts are the same.
 */
export const unifiedDiff = (
  before: string,
  after: string,
  { beforeName = "before", afterName = "after", context = 3 } = {},
): string => {
  if (before === after) {
    return "";
  }
  // util.diff marks lines only in its first argument with 1 and lines only
  // in its second with -1, the reverse of a patch's signs.
  const entries: Entry[] = diff(toLines(before), toLines(after)).map(
    ([op, text]) => ({ mark: op === 1 ? "-" : op === -1 ? "+" : " ", text }),
  );
  const changed = entries.flatMap((e, i) => (e.mark === " " ? [] : [i]));
  const hunks: { start: number; end: number }[] = [];
  for (const i of changed) {
    const last = hunks[hunks.length - 1];
    const start = Math.max(0, i - context);
    const end = Math.min(entries.length, i + context + 1);
    if (last && start <= last.end) {
      last.end = end;
    } else {
      hunks.push({ start, end });
    }
  }
  const lines = [`--- ${beforeName}`, `+++ ${afterName}`];
  let oldLine = 1;
  let newLine = 1;
  let position = 0;
  for (const { start, end } of hunks) {
    for (; position < start; position++) {
      const { mark } = entries[position];
      if (mark !== "+") oldLine++;
      if (mark !== "-") newLine++;
    }
    const hunk = entries.slice(start, end);
    const oldCount = hunk.filter((e) => e.mark !== "+").length;
    const newCount = hunk.filter((e) => e.mark !== "-").length;
    lines.push(
      `@@ -${range(oldLine, oldCount)} +${range(newLine, newCount)} @@`,
    );
    for (const { mark, text } of hunk) {
      if (text.endsWith("\n")) {
        lines.push(`${mark}${text.slice(0, -1)}`);
      } else {
        lines.push(`${mark}${text}`, "\\ No newline at end of file");
      }
    }
  }
  return lines.join("\n") + "\n";
};
