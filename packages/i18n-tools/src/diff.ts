/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

interface Entry {
  mark: " " | "-" | "+";
  text: string;
}

/**
 * A file as lines, each keeping its newline. Only the last line can lack
 * one, which makes it a different line from the same text with a newline,
 * as the diff sees it.
 */
const toLines = (text: string): string[] =>
  text.match(/[^\n]*\n|[^\n]+$/g) ?? [];

/**
 * Myers' greedy shortest-edit diff. `util.diff` is this algorithm, but it
 * arrived in Node 24 and this package supports Node 20.
 *
 * Quadratic in the number of differing lines, so callers should trim the
 * common prefix and suffix first; uploads mostly change a few lines.
 */
const myers = (a: string[], b: string[]): Entry[] => {
  const n = a.length;
  const m = b.length;
  // Furthest-reaching x for each diagonal k = x - y, offset as k can be
  // negative. trace[d] is the state before round d, for backtracking.
  const offset = n + m;
  const v = new Array<number>(2 * offset + 1).fill(0);
  const trace: number[][] = [];
  let depth = 0;
  search: for (;;) {
    trace.push(v.slice());
    for (let k = -depth; k <= depth; k += 2) {
      let x =
        k === -depth || (k !== depth && v[offset + k - 1] < v[offset + k + 1])
          ? v[offset + k + 1]
          : v[offset + k - 1] + 1;
      let y = x - k;
      while (x < n && y < m && a[x] === b[y]) {
        x++;
        y++;
      }
      v[offset + k] = x;
      if (x >= n && y >= m) {
        break search;
      }
    }
    depth++;
  }
  const entries: Entry[] = [];
  let x = n;
  let y = m;
  for (let d = depth; d > 0; d--) {
    const prev = trace[d];
    const k = x - y;
    const prevK =
      k === -d || (k !== d && prev[offset + k - 1] < prev[offset + k + 1])
        ? k + 1
        : k - 1;
    const prevX = prev[offset + prevK];
    const prevY = prevX - prevK;
    while (x > prevX && y > prevY) {
      entries.push({ mark: " ", text: a[--x] });
      y--;
    }
    if (x === prevX) {
      entries.push({ mark: "+", text: b[--y] });
    } else {
      entries.push({ mark: "-", text: a[--x] });
    }
  }
  while (x > 0) {
    entries.push({ mark: " ", text: a[--x] });
    y--;
  }
  return entries.reverse();
};

/**
 * Within each run of changes, deletions before insertions, as a patch
 * shows them and whichever way the backtrack happened to order them.
 */
const deletionsFirst = (entries: Entry[]): Entry[] => {
  const result: Entry[] = [];
  let insertions: Entry[] = [];
  for (const entry of entries) {
    if (entry.mark === "+") {
      insertions.push(entry);
    } else {
      if (entry.mark === " " && insertions.length) {
        result.push(...insertions);
        insertions = [];
      }
      result.push(entry);
    }
  }
  return [...result, ...insertions];
};

const common = (text: string): Entry => ({ mark: " ", text });

const diffLines = (before: string[], after: string[]): Entry[] => {
  let start = 0;
  while (
    start < before.length &&
    start < after.length &&
    before[start] === after[start]
  ) {
    start++;
  }
  let beforeEnd = before.length;
  let afterEnd = after.length;
  while (
    beforeEnd > start &&
    afterEnd > start &&
    before[beforeEnd - 1] === after[afterEnd - 1]
  ) {
    beforeEnd--;
    afterEnd--;
  }
  return [
    ...before.slice(0, start).map(common),
    ...deletionsFirst(
      myers(before.slice(start, beforeEnd), after.slice(start, afterEnd)),
    ),
    ...before.slice(beforeEnd).map(common),
  ];
};

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
  const entries = diffLines(toLines(before), toLines(after));
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
