/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from "vitest";
import { diffCatalogs } from "../src/commands/upload.ts";

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
