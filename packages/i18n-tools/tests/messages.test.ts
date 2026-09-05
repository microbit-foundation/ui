/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from "vitest";
import {
  dropInvalidTranslations,
  parseCatalog,
  tidySource,
  tidyTranslation,
  validateSource,
  validateTranslation,
} from "../src/messages.ts";

const english = {
  b: { defaultMessage: "Save {name}", description: "Save button" },
  a: { defaultMessage: "Open", description: "Open button" },
  c: { defaultMessage: "Colour" },
};

describe("tidySource", () => {
  it("sorts ids and keeps descriptions", () => {
    expect(Object.keys(tidySource(english))).toEqual(["a", "b", "c"]);
    expect(tidySource(english).b).toEqual({
      defaultMessage: "Save {name}",
      description: "Save button",
    });
  });
});

describe("tidyTranslation", () => {
  it("keeps only translated ids still in English, without descriptions", () => {
    const result = tidyTranslation(english, {
      stale: { defaultMessage: "Gone" },
      b: { defaultMessage: "Enregistrer {name}", description: "Save button" },
      a: { defaultMessage: "" },
      c: { defaultMessage: "Colour" },
    });
    expect(result).toEqual({
      b: { defaultMessage: "Enregistrer {name}" },
      c: { defaultMessage: "Colour" },
    });
  });

  it("keeps only the differences for a hand-maintained overrides locale", () => {
    const result = tidyTranslation(
      english,
      {
        a: { defaultMessage: "Open" },
        c: { defaultMessage: "Color" },
      },
      { overrides: true },
    );
    expect(result).toEqual({ c: { defaultMessage: "Color" } });
  });
});

describe("validation", () => {
  it("reports placeholder mismatches with both texts", () => {
    const issues = validateTranslation("lang/ui.fr.json", english, {
      b: { defaultMessage: "Enregistrer {nom}" },
    });
    expect(issues).toHaveLength(1);
    expect(issues[0].id).toBe("b");
    expect(issues[0].message).toContain("missing {name}");
    expect(issues[0].message).toContain("unexpected {nom}");
  });

  it("reports unparseable messages", () => {
    expect(
      validateSource("lang/ui.en.json", { x: { defaultMessage: "{oops" } }),
    ).toHaveLength(1);
    expect(
      validateTranslation("lang/ui.fr.json", english, {
        b: { defaultMessage: "{name" },
      }),
    ).toHaveLength(1);
  });
});

describe("dropInvalidTranslations", () => {
  it("removes translations with placeholder problems and reports them", () => {
    const translated = {
      a: { defaultMessage: "Ouvrir" },
      b: { defaultMessage: "Enregistrer {nom}" },
    };
    const issues = dropInvalidTranslations(
      "lang/ui.fr.json",
      english,
      translated,
    );
    expect(issues.map((i) => i.id)).toEqual(["b"]);
    expect(translated).toEqual({ a: { defaultMessage: "Ouvrir" } });
  });
});

describe("parseCatalog", () => {
  it("rejects entries without a defaultMessage", () => {
    expect(() => parseCatalog('{"a": {"message": "x"}}', "f")).toThrow(
      /a has no defaultMessage/,
    );
    expect(() => parseCatalog("nope", "f")).toThrow(/^f: /);
  });
});
