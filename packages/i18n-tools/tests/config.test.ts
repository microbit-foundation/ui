/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  ConfigError,
  catalogLanguages,
  catalogLocales,
  inCrowdin,
  expandTemplate,
  resolveConfig,
  strayTranslationFiles,
} from "../src/config.ts";

const base = {
  crowdin: { project: "microbitorg", branch: "new", directory: "apps/x" },
  languages: ["fr", "pt-BR"],
};

describe("resolveConfig", () => {
  it("fills catalog defaults from the source path", () => {
    const config = resolveConfig(
      { ...base, catalogs: [{ source: "lang/ui.en.json", local: ["en-US"] }] },
      "/repo",
    );
    expect(config.catalogs[0]).toMatchObject({
      crowdinFile: "ui.en.json",
      translations: "lang/ui.{lang}.json",
      packages: [],
      local: ["en-US"],
    });
    expect(catalogLocales(config, config.catalogs[0])).toEqual([
      "en",
      "en-US",
      "fr",
      "pt-BR",
    ]);
  });

  it("lets a catalog override the languages or opt out of Crowdin", () => {
    const config = resolveConfig(
      {
        ...base,
        catalogs: [
          { source: "lang/a.en.json", languages: ["fr"] },
          { source: "lang/b.en.json", languages: [], local: ["cy"] },
        ],
      },
      "/repo",
    );
    expect(catalogLanguages(config, config.catalogs[0])).toEqual(["fr"]);
    expect(inCrowdin(config.catalogs[0])).toBe(true);
    expect(catalogLocales(config, config.catalogs[1])).toEqual(["en", "cy"]);
    expect(inCrowdin(config.catalogs[1])).toBe(false);
  });

  it("rejects en as a language and unusable sources", () => {
    expect(() =>
      resolveConfig({ ...base, languages: ["en", "fr"] }, "/"),
    ).toThrow(ConfigError);
    expect(() =>
      resolveConfig(
        { ...base, catalogs: [{ source: "lang/strings.json" }] },
        "/",
      ),
    ).toThrow(/translations/);
    expect(() => resolveConfig({ languages: [] }, "/")).toThrow(/crowdin/);
  });
});

describe("expandTemplate", () => {
  it("keeps Crowdin casing for {lang} and lowercases {lang:lower}", () => {
    expect(expandTemplate("lang/ui.{lang}.json", "pt-BR")).toBe(
      "lang/ui.pt-BR.json",
    );
    expect(expandTemplate("api.{lang:lower}.json", "pt-BR")).toBe(
      "api.pt-br.json",
    );
  });
});

describe("strayTranslationFiles", () => {
  let dir: string;
  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("finds translated files for languages the config does not list", () => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "i18n-"));
    fs.mkdirSync(path.join(dir, "lang"));
    for (const name of [
      "ui.en.json",
      "ui.fr.json",
      "ui.de.json",
      "ui.en-US.json",
      "other.de.json",
    ]) {
      fs.writeFileSync(path.join(dir, "lang", name), "{}");
    }
    const config = resolveConfig(
      { ...base, catalogs: [{ source: "lang/ui.en.json", local: ["en-US"] }] },
      dir,
    );
    expect(strayTranslationFiles(config, config.catalogs[0])).toEqual([
      "lang/ui.de.json",
    ]);
  });
});
