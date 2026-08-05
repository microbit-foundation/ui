/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { defineSlotRecipe } from "@pandacss/dev";

/**
 * Breadcrumb slot recipe — Chakra's Breadcrumb layout: a flex list with a
 * separator between items. The links themselves are the shared `Link`
 * (Chakra's BreadcrumbLink base was identical to its Link base), so there is
 * no link slot; the current page renders as a plain span.
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
      // Chakra's default `spacing` was a literal 0.5rem; the token follows
      // the library's existing lean (the button icon gap made the same
      // call — see the playbook's open token-vs-literal spacing decision).
      mx: "2",
    },
  },
});
