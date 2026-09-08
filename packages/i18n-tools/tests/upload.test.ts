/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  diffCatalogs,
  uploadContent,
  uploadTargets,
} from "../src/commands/upload.ts";
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
      {
        source: "crowdin/api.en.json",
        crowdinFile: "api.en.json",
        name: "api.en.json",
      },
    ]);
  });

  it("expands a directory source to one target per file, hooks attached", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "i18n-tools-"));
    fs.mkdirSync(path.join(root, "docs/sub"), { recursive: true });
    fs.writeFileSync(path.join(root, "docs/b.md"), "b");
    fs.writeFileSync(path.join(root, "docs/a.md"), "a");
    fs.writeFileSync(path.join(root, "docs/sub/c.md"), "c");
    fs.writeFileSync(path.join(root, "docs/.hidden"), "");
    const beforeUpload = (text: string) => text;
    const config = resolveConfig(
      {
        crowdin: { project: 1, directory: "ext/x" },
        languages: ["fr"],
        files: [
          {
            crowdinFile: "docs/",
            local: "docs/_locales/{lang}/",
            source: "docs/",
            beforeUpload,
          },
        ],
      },
      root,
    );
    expect(uploadTargets(config)).toEqual([
      {
        source: "docs/a.md",
        crowdinFile: "docs/a.md",
        name: "a.md",
        beforeUpload,
      },
      {
        source: "docs/b.md",
        crowdinFile: "docs/b.md",
        name: "b.md",
        beforeUpload,
      },
      {
        source: "docs/sub/c.md",
        crowdinFile: "docs/sub/c.md",
        name: "sub/c.md",
        beforeUpload,
      },
    ]);
  });

  it("rejects a directory entry whose source is not a directory", () => {
    const config = resolveConfig(
      {
        crowdin: { project: 1, directory: "ext/x" },
        languages: ["fr"],
        files: [
          {
            crowdinFile: "docs/",
            local: "docs/_locales/{lang}/",
            source: "nowhere/",
          },
        ],
      },
      "/repo",
    );
    expect(() => uploadTargets(config)).toThrow(/nowhere\/ is not a directory/);
  });
});

describe("uploadContent", () => {
  it("rewrites a file through its hook, given its name", () => {
    const seen: string[] = [];
    const content = uploadContent(
      {
        source: "docs/page.md",
        crowdinFile: "docs/page.md",
        name: "page.md",
        beforeUpload: (text, { name }) => {
          seen.push(name);
          return text.replace(
            /#v[\d.]+$/m,
            "#{version_placeholder_do_not_translate}",
          );
        },
      },
      "# Title\n\n```package\next=github:org/ext#v1.2.3\n```\n",
    );
    expect(content).toBe(
      "# Title\n\n```package\next=github:org/ext#{version_placeholder_do_not_translate}\n```\n",
    );
    expect(seen).toEqual(["page.md"]);
  });

  it("leaves a file without a hook alone", () => {
    expect(
      uploadContent(
        { source: "a.json", crowdinFile: "a.json", name: "a.json" },
        "{}",
      ),
    ).toBe("{}");
  });
});
