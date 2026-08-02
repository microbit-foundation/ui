/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { defineSlotRecipe } from "@pandacss/dev";

/**
 * ListBox slot recipe — a standalone list of choosable options, single or
 * multiple. Distinct from the `select` recipe's `list`/`option` slots, which
 * style the same react-aria primitive inside a dropdown card: this one sits
 * inline on the page, so it carries no surface of its own.
 *
 * An option is a leaf — if the rows need their own buttons or menus, they
 * want `GridList` instead.
 *
 * Registered in the base preset (base-preset.ts), which also has the
 * `staticCss` entry that keeps the runtime-prop variants generated.
 */
export const listBox = defineSlotRecipe({
  className: "list-box",
  slots: ["root", "option"],
  base: {
    root: {
      // The listbox holds the roving tab index, so it is focusable itself and
      // would otherwise draw the platform ring around the whole list.
      outline: "none",
    },
    option: {
      display: "flex",
      alignItems: "center",
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
