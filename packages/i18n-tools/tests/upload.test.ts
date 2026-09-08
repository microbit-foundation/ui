/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from "vitest";
import { diffCatalogs, uploadTargets } from "../src/commands/upload.ts";
import { resolveConfig } from "../src/config.ts";

describe("diffCatalogs", () => {
  it("classifies additions, removals, text and description changes", () => {
    const diff = diffCatalogs(
      {
        a: { defaultMessage: "A", description: "a" },
        b: { defaultMessage: "B", description: "b" },
        c: { defaultMessage: "C" },
        d: { defaultMessage: "D" },
      },
      {
        a: { defaultMessage: "A", description: "a" },
        b: { defaultMessage: "B!", description: "b" },
        c: { defaultMessage: "C", description: "new context" },
        e: { defaultMessage: "E" },
      },
    );
    expect(diff).toEqual({
      added: ["e"],
      removed: ["d"],
      changed: ["b"],
      descriptionOnly: ["c"],
    });
  });
});

describe("uploadTargets", () => {
  it("marks catalogs, with their Crowdin format, for an id-by-id diff", () => {
    const config = resolveConfig(
      {
        crowdin: { project: 1, directory: "apps/x" },
        languages: ["fr"],
        catalogs: [
          { source: "lang/ui.en.json" },
          { source: "lang/old.en.json", crowdinFormat: "chrome" },
        ],
        files: [
          {
            crowdinFile: "api.en.json",
            local: "t/api.{lang}.json",
            source: "crowdin/api.en.json",
          },
          { crowdinFile: "docs/", local: "docs/_locales/{lang}/" },
        ],
      },
      "/repo",
    );
    expect(uploadTargets(config)).toEqual([
      {
        source: "lang/ui.en.json",
        crowdinFile: "ui.en.json",
        catalog: "react-intl",
      },
      {
        source: "lang/old.en.json",
        crowdinFile: "old.en.json",
        catalog: "chrome",
      },
      { source: "crowdin/api.en.json", crowdinFile: "api.en.json" },
    ]);
  });
});
