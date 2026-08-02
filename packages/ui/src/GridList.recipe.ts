/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { defineSlotRecipe } from "@pandacss/dev";

/**
 * GridList slot recipe — a vertical list of selectable rows, each of which may
 * hold its own interactive controls (which is what makes it a grid rather than
 * a listbox: the roving tab index moves through rows, and the controls inside
 * a row are reachable without leaving it).
 *
 * Chakra had no equivalent, so there is no Chakra look to match: the greys
 * here are the family's neutral list styling, and an app with a strong
 * selection colour restates them (classroom's roster does).
 *
 * Registered in the base preset (base-preset.ts), which also has the
 * `staticCss` entry that keeps the runtime-prop variants generated.
 */
export const gridList = defineSlotRecipe({
  className: "grid-list",
  slots: ["root", "item"],
  base: {
    root: {
      // The list takes the roving tab index, so it is focusable itself and
      // would otherwise draw the platform ring around the whole list.
      outline: "none",
    },
    item: {
      display: "flex",
      alignItems: "center",
      position: "relative",
      // A row is interactive by definition — it selects, or it acts.
      cursor: "pointer",
      outline: "none",
      transitionProperty: "background",
      transitionDuration: "ultra-fast",
      transitionTimingFunction: "ease-in",
      _hover: { bg: "gray.50" },
      "&[data-selected]": { bg: "gray.100", _hover: { bg: "gray.100" } },
      "&[data-focus-visible]": { focusShadow: "outline" },
      "&[data-disabled]": { opacity: 0.4, cursor: "not-allowed" },
    },
  },
});
