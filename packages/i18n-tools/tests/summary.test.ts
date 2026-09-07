/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from "vitest";
import { formatSummary } from "../src/summary.ts";

describe("formatSummary", () => {
  it("is a count alone when everything downloaded", () => {
    expect(
      formatSummary({ written: ["lang/ui.fr.json"], failed: [], dropped: [] }),
    ).toBe("## Translation sync\n\nDownloaded 1 file.\n");
  });

  it("lists failures and the translations left out with both texts", () => {
    const summary = formatSummary({
      written: ["lang/ui.fr.json", "lang/ui.de.json"],
      failed: [{ file: "apps/x/other.json", error: "No file" }],
      dropped: [
        {
          file: "lang/ui.fr.json",
          id: "greeting",
          message: "missing {name}",
          english: "Hello {name}",
          translation: "Bonjour {nom}",
        },
      ],
    });
    expect(summary).toContain("Downloaded 2 files; 1 download failed.");
    expect(summary).toContain(
      "### Failed downloads (1)\n\n- `apps/x/other.json`: No file",
    );
    expect(summary).toContain("### Translations left out (1)");
    expect(summary).toContain(
      "- `lang/ui.fr.json` `greeting`: missing {name}\n  - en: `Hello {name}`\n  - translated: `Bonjour {nom}`",
    );
  });
});
