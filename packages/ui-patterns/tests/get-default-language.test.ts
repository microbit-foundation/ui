/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { expect, it } from "vitest";
import { getDefaultLanguageId } from "../src";

const ids = ["en", "fr", "pt-BR", "zh-CN"];

it("matches the browser preference list", () => {
  expect(
    getDefaultLanguageId({
      autoSelectableIds: ids,
      fallbackId: "en",
      requestedLanguages: ["fr-FR", "en"],
    }),
  ).toBe("fr");
});

it("best-fits regional variants", () => {
  expect(
    getDefaultLanguageId({
      autoSelectableIds: ids,
      fallbackId: "en",
      requestedLanguages: ["pt-PT"],
    }),
  ).toBe("pt-BR");
});

it("prefers the URL hint over browser languages", () => {
  expect(
    getDefaultLanguageId({
      autoSelectableIds: ids,
      fallbackId: "en",
      languageHint: "zh-CN",
      requestedLanguages: ["fr"],
    }),
  ).toBe("zh-CN");
});

it("hint casing is forgiven", () => {
  expect(
    getDefaultLanguageId({
      autoSelectableIds: ids,
      fallbackId: "en",
      languageHint: "zh-cn",
      requestedLanguages: [],
    }),
  ).toBe("zh-CN");
});

it("falls back when nothing matches", () => {
  expect(
    getDefaultLanguageId({
      autoSelectableIds: ids,
      fallbackId: "en",
      requestedLanguages: ["ja", "ko"],
    }),
  ).toBe("en");
});

it("only auto-selects from the candidate set", () => {
  expect(
    getDefaultLanguageId({
      autoSelectableIds: ["en", "nl"],
      fallbackId: "en",
      languageHint: "fr",
      requestedLanguages: ["fr"],
    }),
  ).toBe("en");
});

it("ignores malformed tags rather than throwing", () => {
  expect(
    getDefaultLanguageId({
      autoSelectableIds: ids,
      fallbackId: "en",
      languageHint: "!!",
      requestedLanguages: ["not a tag", "fr"],
    }),
  ).toBe("fr");
});
