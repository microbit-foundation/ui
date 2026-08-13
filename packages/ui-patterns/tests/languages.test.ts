/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { expect, it } from "vitest";
import { languageFromId, languageOrder, languages } from "../src";

it("ids are canonical BCP 47 (which is also Crowdin's casing)", () => {
  for (const { id } of languages) {
    expect(Intl.getCanonicalLocales(id)[0]).toBe(id);
  }
});

it("ids are unique", () => {
  const ids = languages.map((l) => l.id);
  expect(new Set(ids).size).toBe(ids.length);
});

it("orders English first, then by English name", () => {
  expect(languages[0].id).toBe("en");
  const enNames = languages.slice(1).map((l) => l.enName);
  expect(enNames).toEqual([...enNames].sort());
});

it("looks up registry entries", () => {
  expect(languageFromId("cy")).toEqual({
    id: "cy",
    name: "Cymraeg",
    enName: "Welsh",
  });
  expect(languageOrder("en")).toBe(0);
  expect(languageOrder("not-a-language")).toBe(languages.length);
});
