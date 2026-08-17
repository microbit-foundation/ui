/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { defineSlotRecipe } from "@pandacss/dev";

/**
 * Toast slot recipe — a solid alert card with white text, teal for every
 * status except error. Status colours come from the `toast*Bg` semantic
 * tokens so brand presets can retune them without touching the recipe.
 *
 * Registered in the base preset (base-preset.ts). The status variant
 * is chosen at runtime from the toast content, so it needs the preset's
 * `staticCss` entry.
 */
export const toast = defineSlotRecipe({
  className: "toast",
  slots: [
    "region",
    "root",
    "content",
    "body",
    "icon",
    "title",
    "description",
    "closeButton",
  ],
  base: {
    region: {
      position: "fixed",
      top: "4",
      left: "50%",
      transform: "translateX(-50%)",
      // Percentage centring of a text-width region lands the toasts on a
      // fractional pixel. Chrome floors ::view-transition-group's transform to
      // a whole CSS pixel, so the snapshot the enter/exit animation displays
      // sits up to 1px left of the element it stands in for, and every toast
      // jumps right as the transition hands back to the real DOM (visible
      // above 1x, where the two no longer round to the same device pixel).
      // Rounding the region's own offsets keeps it on whole pixels so the two
      // agree. round() postdates view transitions in Chrome (130 vs 111), so
      // the guard keeps the plain centring for the versions in between rather
      // than dropping the declarations and losing it altogether.
      "@supports (left: round(50%, 1px))": {
        left: "round(50%, 1px)",
        transform: "translateX(round(-50%, 1px))",
      },
      zIndex: "toast",
      display: "flex",
      flexDirection: "column",
      gap: "2",
      pointerEvents: "none",
    },
    root: {
      position: "relative",
      display: "flex",
      alignItems: "flex-start",
      p: "4",
      // Leave room for the absolutely-positioned close button plus breathing
      // space so its hover area never overlaps the title text (24px button at
      // 4px inset spans ~4-28px from the end edge; content stops at 40px for
      // a ~12px gap). Logical, like the button's own inset.
      paddingEnd: "10",
      borderRadius: "md",
      boxShadow: "lg",
      color: "white",
      maxW: "sm",
      pointerEvents: "auto",
      // The card is focusable (RAC gives it tabindex), so it takes the
      // house ring rather than the UA default. Ink, because the ring is
      // drawn on the page, not the card — Toast.tsx tags the close button.
      outline: "none",
      _focusVisible: { focusRing: "outline" },
    },
    // The icon has to be inside the alert region to be announced with the
    // message, so this row — not the root — is what lays the two out.
    content: {
      display: "flex",
      alignItems: "flex-start",
      gap: "3",
      // Let the text shrink below its content width so long words wrap
      // instead of pushing past the toast's maxW.
      minWidth: 0,
    },
    body: {
      minWidth: 0,
    },
    icon: {
      fontSize: "1.25rem",
      flexShrink: 0,
    },
    title: {
      fontWeight: "bold",
    },
    description: {
      mt: "1",
    },
    closeButton: {
      // A sized box with the glyph centred (24px box, 2xs glyph) gives
      // padding around the X and a hover affordance.
      position: "absolute",
      top: "1",
      insetEnd: "1",
      color: "white",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "6",
      height: "6",
      padding: "0",
      fontSize: "2xs",
      borderRadius: "md",
      cursor: "pointer",
      bg: "transparent",
      border: "none",
      outline: "none",
      transitionProperty: "background-color, box-shadow",
      transitionDuration: "normal",
      // Hover is a subtle dark overlay (blackAlpha), not a bright highlight.
      _hover: { bg: "blackAlpha.100" },
      _active: { bg: "blackAlpha.200" },
      _focusVisible: { focusRing: "outline" },
    },
  },
  variants: {
    status: {
      info: { root: { bg: "toastInfoBg" } },
      success: { root: { bg: "toastSuccessBg" } },
      warning: { root: { bg: "toastWarningBg" } },
      error: { root: { bg: "toastErrorBg" } },
    },
  },
  defaultVariants: { status: "info" },
});
