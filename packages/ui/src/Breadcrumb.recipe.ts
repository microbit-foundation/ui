/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { defineSlotRecipe } from "@pandacss/dev";

/**
 * Breadcrumb slot recipe — a flex list with a separator between items. The
 * links themselves are the shared `Link`, so there is no link slot; the
 * current page renders as a plain span.
 *
 * Registered in the base preset (base-preset.ts). No variants, so it needs
 * no `staticCss` entry.
 */
export const breadcrumb = defineSlotRecipe({
  className: "breadcrumb",
  slots: ["root", "list", "item", "separator"],
  base: {
    root: {},
    list: {
      display: "flex",
      alignItems: "center",
      listStyle: "none",
      margin: 0,
      padding: 0,
    },
    item: {
      display: "inline-flex",
      alignItems: "center",
      // The separator renders inside every item (no children introspection);
      // the last item's simply doesn't show.
      "&:last-of-type [data-separator]": { display: "none" },
    },
    separator: {
      mx: "2",
      // A chevron separator points along the trail, so it has to turn round
      // in RTL. Scoped to an svg because the default separator is the text
      // "/", which would become "\": a caller passing a glyph owns its
      // direction, one passing an icon gets it handled. Override via the
      // separator slot's css for an icon that shouldn't turn.
      _rtl: { "& svg": { transform: "scaleX(-1)" } },
    },
  },
});
