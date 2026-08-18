/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from "vitest";
import { basePreset } from "../src/base-preset";
import {
  droppedConditionTokens,
  reservedSemanticTokens,
  unknownSemanticTokens,
} from "../src/preset-lint";

// Shaped like a definePreset result; the checker only reads `theme`.
const preset = (semanticTokens: unknown) => ({
  name: "test",
  theme: { extend: { semanticTokens } },
});

describe("unknownSemanticTokens", () => {
  it("accepts an override of a role the base preset defines", () => {
    expect(
      unknownSemanticTokens(
        preset({ colors: { fg: { link: { value: "{colors.brand.500}" } } } }),
      ),
    ).toEqual([]);
  });

  it("accepts a nested component-group override", () => {
    expect(
      unknownSemanticTokens(
        preset({
          colors: { button: { primary: { bg: { value: "{colors.black}" } } } },
        }),
      ),
    ).toEqual([]);
  });

  it("catches a leaf that no longer exists under a group that does", () => {
    // The subtle case: the group name still resolves, so a flat key left
    // behind by a nesting change reads as plausible.
    expect(
      unknownSemanticTokens(
        preset({ colors: { button: { primaryBg: { value: "#000" } } } }),
      ),
    ).toEqual(["colors.button.primaryBg"]);
  });

  it("catches a renamed top-level token", () => {
    // A whole token renamed out from under a preset, leaving the override
    // pointing at nothing.
    expect(
      unknownSemanticTokens(
        preset({
          colors: {
            toastSuccessBg: { value: "{colors.blimpTeal.700}" },
            toastErrorBg: { value: "{colors.code.error}" },
          },
        }),
      ),
    ).toEqual(["colors.toastErrorBg", "colors.toastSuccessBg"]);
  });

  it("allows tokens a preset declares as its own", () => {
    expect(
      unknownSemanticTokens(
        preset({
          colors: { sidebarHeaderBg: { value: "{colors.brand.500}" } },
        }),
        { introduces: ["colors.sidebarHeaderBg"] },
      ),
    ).toEqual([]);
  });

  it("reads a condition object as one leaf, not a base/_onDark pair", () => {
    expect(
      unknownSemanticTokens(
        preset({
          colors: {
            focusRing: { value: { base: "#000", _onDark: "#fff" } },
          },
        }),
      ),
    ).toEqual([]);
  });

  it("reports nothing for the base preset against itself", () => {
    expect(unknownSemanticTokens(basePreset)).toEqual([]);
  });

  it("tolerates a preset with no semantic tokens", () => {
    expect(unknownSemanticTokens({ name: "empty", theme: {} })).toEqual([]);
  });
});

describe("droppedConditionTokens", () => {
  it("catches a flat override of a condition-object token", () => {
    expect(
      droppedConditionTokens(
        preset({ colors: { focusRing: { value: "#000" } } }),
      ),
    ).toEqual(["colors.focusRing"]);
  });

  it("catches a condition object missing a key the base value has", () => {
    expect(
      droppedConditionTokens(
        preset({ colors: { focusRing: { value: { base: "#000" } } } }),
      ),
    ).toEqual(["colors.focusRing"]);
  });

  it("accepts an override keeping the full condition shape", () => {
    expect(
      droppedConditionTokens(
        preset({
          colors: {
            focusRing: { value: { base: "#000", _onDark: "#fff" } },
          },
        }),
      ),
    ).toEqual([]);
  });

  it("accepts a deliberate no-flip stated as equal values", () => {
    expect(
      droppedConditionTokens(
        preset({
          colors: {
            fg: { strong: { value: { base: "#000", _onDark: "#000" } } },
          },
        }),
      ),
    ).toEqual([]);
  });

  it("ignores flat tokens overridden flat", () => {
    expect(
      droppedConditionTokens(
        preset({ colors: { fg: { link: { value: "#000" } } } }),
      ),
    ).toEqual([]);
  });

  it("allows a preset to add conditions to a flat token", () => {
    expect(
      droppedConditionTokens(
        preset({
          colors: {
            fg: { link: { value: { base: "#000", _onDark: "#fff" } } },
          },
        }),
      ),
    ).toEqual([]);
  });

  it("reports nothing for the base preset against itself", () => {
    expect(droppedConditionTokens(basePreset)).toEqual([]);
  });
});

describe("reservedSemanticTokens", () => {
  it("flags a declared-new token the library has since defined", () => {
    expect(
      reservedSemanticTokens(
        preset({ colors: { fg: { link: { value: "#000" } } } }),
        { introduces: ["colors.fg.link"] },
      ),
    ).toEqual(["colors.fg.link"]);
  });

  it("stays quiet for a token that is genuinely the preset's own", () => {
    expect(
      reservedSemanticTokens(
        preset({ colors: { sidebarHeaderBg: { value: "#000" } } }),
        { introduces: ["colors.sidebarHeaderBg"] },
      ),
    ).toEqual([]);
  });
});
