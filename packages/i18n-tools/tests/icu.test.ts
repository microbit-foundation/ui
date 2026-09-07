/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from "vitest";
import {
  countWords,
  describeSignatureDifference,
  signature,
} from "../src/icu.ts";

describe("signature", () => {
  it("collects arguments, plural and select arguments, and tags", () => {
    const s = signature(
      "{count, plural, one {# file for {name}} other {# files}} <link>more</link> {when, date, short}",
    );
    expect([...s.arguments].sort()).toEqual(["count", "name", "when"]);
    expect([...s.tags]).toEqual(["link"]);
  });
});

describe("describeSignatureDifference", () => {
  it("accepts reordering and different plural categories", () => {
    expect(
      describeSignatureDifference(
        "{count, plural, one {# item} other {# items}} for {name}",
        "{name}: {count, plural, one {# element} few {# elementy} many {# elementów} other {# elementu}}",
      ),
    ).toBeUndefined();
  });

  it("reports missing and unexpected placeholders", () => {
    expect(
      describeSignatureDifference(
        "Hello {name}, <b>welcome</b>",
        "Bonjour {nom}, bienvenue",
      ),
    ).toBe("missing {name}; unexpected {nom}; missing <b>");
  });

  it("throws when the translation does not parse", () => {
    expect(() => describeSignatureDifference("{count}", "{count")).toThrow();
  });
});

describe("countWords", () => {
  it("counts words the way Crowdin does", () => {
    expect(countWords("Download the hex file")).toBe(4);
    expect(countWords("A well-known hyphenated-word")).toBe(3);
    expect(countWords("Hello {name}")).toBe(2);
    expect(countWords("<link>Learn more</link> about micro:bit")).toBe(4);
  });

  it("counts every plural branch", () => {
    expect(
      countWords("{count, plural, one {# sample} other {# samples}}"),
    ).toBe(2);
  });
});
