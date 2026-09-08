/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from "vitest";
import { unifiedDiff } from "../src/diff.ts";

const page = (pin: string) =>
  `# on ML start\n\nStarts a handler.\n\n\`\`\`package\nstubs=github:org/stubs#v0.0.1\nmachine-learning=github:org/ext#${pin}\n\`\`\`\n`;

describe("unifiedDiff", () => {
  it("is empty for identical text", () => {
    expect(unifiedDiff("a\nb\n", "a\nb\n")).toBe("");
  });

  it("shows a changed line with context, removed before added", () => {
    expect(
      unifiedDiff(page("v1.0.4"), page("{version}"), {
        beforeName: "crowdin/page.md",
        afterName: "docs/page.md",
      }),
    ).toBe(
      [
        "--- crowdin/page.md",
        "+++ docs/page.md",
        "@@ -4,5 +4,5 @@",
        " ",
        " ```package",
        " stubs=github:org/stubs#v0.0.1",
        "-machine-learning=github:org/ext#v1.0.4",
        "+machine-learning=github:org/ext#{version}",
        " ```",
        "",
      ].join("\n"),
    );
  });

  it("splits distant changes into hunks and merges nearby ones", () => {
    const before = Array.from({ length: 20 }, (_, i) => `line ${i + 1}`);
    const after = [...before];
    after[1] = "changed 2";
    after[4] = "changed 5";
    after[17] = "changed 18";
    const result = unifiedDiff(
      before.join("\n") + "\n",
      after.join("\n") + "\n",
      {
        context: 1,
      },
    );
    expect(result.match(/^@@ .* @@$/gm)).toEqual([
      "@@ -1,6 +1,6 @@",
      "@@ -17,3 +17,3 @@",
    ]);
    expect(result).toContain(
      "-line 2\n+changed 2\n line 3\n line 4\n-line 5\n+changed 5\n",
    );
  });

  it("annotates a line with no final newline, uncounted", () => {
    expect(unifiedDiff("a\nb", "a\nb\n")).toBe(
      [
        "--- before",
        "+++ after",
        "@@ -1,2 +1,2 @@",
        " a",
        "-b",
        "\\ No newline at end of file",
        "+b",
        "",
      ].join("\n"),
    );
    expect(unifiedDiff("a\nb", "a\nc")).toContain(
      "@@ -1,2 +1,2 @@\n a\n-b\n\\ No newline at end of file\n+c\n\\ No newline at end of file\n",
    );
  });

  it("abbreviates hunk ranges of one line and of none", () => {
    expect(unifiedDiff("a\n", "b\n")).toContain("\n@@ -1 +1 @@\n");
    expect(unifiedDiff("", "a\nb\n")).toContain("\n@@ -0,0 +1,2 @@\n");
    expect(unifiedDiff("a\n", "")).toContain("\n@@ -1 +0,0 @@\n");
  });
});
