/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from "vitest";
import { parseCrowdinCatalog, toCrowdinFormat } from "../src/formats.ts";
import { serializeCatalog } from "../src/messages.ts";

const catalog = {
  about: { defaultMessage: "About", description: "About action" },
  "results-count": {
    defaultMessage:
      "{count, plural, =0 {No results} one {# result} other {# results}}",
  },
};

const chrome = `{
  "about": {
    "message": "About",
    "description": "About action"
  },
  "results-count": {
    "message": "{count, plural, =0 {No results} one {# result} other {# results}}"
  }
}
`;

describe("chrome format", () => {
  it("round-trips a react-intl source through Chrome JSON", () => {
    const text = serializeCatalog(catalog);
    expect(toCrowdinFormat(text, "chrome", "ui.en.json")).toBe(chrome);
    expect(parseCrowdinCatalog(chrome, "chrome", "ui.en.json")).toEqual(
      catalog,
    );
  });

  it("ignores a placeholders block and requires a message string", () => {
    expect(
      parseCrowdinCatalog(
        JSON.stringify({
          a: { message: "A", placeholders: { x: { content: "$1" } } },
        }),
        "chrome",
        "x",
      ),
    ).toEqual({ a: { defaultMessage: "A" } });
    expect(() =>
      parseCrowdinCatalog(
        JSON.stringify({ a: { defaultMessage: "A" } }),
        "chrome",
        "x",
      ),
    ).toThrow(/message a has no message string/);
  });
});

describe("react-intl format", () => {
  it("passes the source through untouched and parses translations as-is", () => {
    const text = serializeCatalog(catalog) + "  \n";
    expect(toCrowdinFormat(text, "react-intl", "ui.en.json")).toBe(text);
    expect(parseCrowdinCatalog(text, "react-intl", "ui.en.json")).toEqual(
      catalog,
    );
  });
});
