/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { compileCatalog, mergeMessages } from "../src/compile.ts";
import { resolveConfig } from "../src/config.ts";
import { tidy } from "../src/commands/tidy.ts";
import { readCatalog } from "../src/messages.ts";

let root: string;

const write = (relative: string, value: unknown) => {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
};

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "i18n-"));
  write("package.json", { name: "app", private: true });
  write("lang/ui.en.json", {
    colour: { defaultMessage: "Colour" },
    greeting: { defaultMessage: "Hello {name}", description: "Greeting" },
  });
  write("lang/ui.fr.json", { greeting: { defaultMessage: "Bonjour {name}" } });
  write("lang/ui.en-US.json", { colour: { defaultMessage: "Color" } });
  // A linked package shipping sparse catalogs.
  write("node_modules/@fake/pkg/package.json", {
    name: "@fake/pkg",
    exports: { "./lang/*": "./lang/*" },
  });
  write("node_modules/@fake/pkg/lang/ui.en.json", {
    "ui.close": { defaultMessage: "Close", description: "Close" },
  });
  write("node_modules/@fake/pkg/lang/ui.fr.json", {
    "ui.close": { defaultMessage: "Fermer" },
  });
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

const config = () =>
  resolveConfig(
    {
      crowdin: { project: 1, directory: "apps/x" },
      languages: ["fr", "pt-BR"],
      catalogs: [
        {
          source: "lang/ui.en.json",
          out: "src/messages/ui.{lang}.json",
          packages: ["@fake/pkg"],
          local: ["en-US"],
        },
      ],
    },
    root,
  );

describe("mergeMessages", () => {
  it("overlays translations on English for the app and its packages", () => {
    const { messages } = mergeMessages(config(), config().catalogs[0], "fr");
    expect(messages).toEqual({
      greeting: "Bonjour {name}",
      colour: "Colour",
      "ui.close": "Fermer",
    });
  });

  it("falls back to English for a language with no files and warns for packages", () => {
    const { messages, warnings } = mergeMessages(
      config(),
      config().catalogs[0],
      "pt-BR",
    );
    expect(messages["ui.close"]).toBe("Close");
    expect(warnings).toEqual([
      "@fake/pkg has no ui.pt-BR.json; its English text will be used",
    ]);
  });

  it("reads lowercase catalog names from packages published before the rename", () => {
    write("node_modules/@fake/pkg/lang/ui.pt-br.json", {
      "ui.close": { defaultMessage: "Fechar" },
    });
    const { messages, warnings } = mergeMessages(
      config(),
      config().catalogs[0],
      "pt-BR",
    );
    expect(messages["ui.close"]).toBe("Fechar");
    expect(warnings).toEqual([]);
  });

  it("applies hand-maintained overrides without warning", () => {
    const { messages, warnings } = mergeMessages(
      config(),
      config().catalogs[0],
      "en-US",
    );
    expect(messages.colour).toBe("Color");
    expect(warnings).toEqual([]);
  });

  it("rejects id collisions between the app and a package", () => {
    write("lang/ui.en.json", { "ui.close": { defaultMessage: "Shut" } });
    expect(() => mergeMessages(config(), config().catalogs[0], "en")).toThrow(
      /ui\.close/,
    );
  });
});

describe("compileCatalog", () => {
  it("writes formatjs AST for every locale", () => {
    const result = compileCatalog(config(), config().catalogs[0]);
    expect(result.written).toEqual([
      "src/messages/ui.en.json",
      "src/messages/ui.en-US.json",
      "src/messages/ui.fr.json",
      "src/messages/ui.pt-BR.json",
    ]);
    const fr = JSON.parse(
      fs.readFileSync(path.join(root, "src/messages/ui.fr.json"), "utf-8"),
    ) as Record<string, unknown[]>;
    expect(fr.greeting).toEqual([
      { type: 0, value: "Bonjour " },
      { type: 1, value: "name" },
    ]);
  });
});

describe("tidy", () => {
  it("migrates English-backfilled translations to sparse ones and reports strays", () => {
    write("lang/ui.fr.json", {
      greeting: { defaultMessage: "Bonjour {name}", description: "Greeting" },
      colour: { defaultMessage: "Colour", description: "copied English" },
      removed: { defaultMessage: "Supprimé" },
    });
    write("lang/ui.de.json", {});
    const result = tidy(config());
    expect(result.changed).toEqual(["lang/ui.fr.json"]);
    expect(result.issues).toEqual([]);
    expect(result.warnings[0]).toMatch(/lang\/ui\.de\.json/);
    // English text identical to the source is a real translation and stays.
    expect(readCatalog(path.join(root, "lang/ui.fr.json"))).toEqual({
      colour: { defaultMessage: "Colour" },
      greeting: { defaultMessage: "Bonjour {name}" },
    });
  });

  it("does not check placeholders in the in-context pseudo-language", () => {
    write("lang/ui.lol.json", {
      greeting: { defaultMessage: "crwdns1:0crwdne1:0" },
    });
    const config = resolveConfig(
      {
        crowdin: { project: 1, directory: "apps/x" },
        languages: ["fr", "lol"],
        catalogs: [{ source: "lang/ui.en.json" }],
      },
      root,
    );
    expect(tidy(config).issues).toEqual([]);
  });

  it("with --check reports without writing", () => {
    write("lang/ui.en.json", {
      greeting: { defaultMessage: "Hello {name}", description: "Greeting" },
      colour: { defaultMessage: "Colour" },
    });
    const before = fs.readFileSync(path.join(root, "lang/ui.en.json"), "utf-8");
    const result = tidy(config(), { check: true });
    expect(result.changed).toEqual(["lang/ui.en.json"]);
    expect(fs.readFileSync(path.join(root, "lang/ui.en.json"), "utf-8")).toBe(
      before,
    );
  });
});
