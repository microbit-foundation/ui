/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { defineSlotRecipe } from "@pandacss/dev";

/**
 * Dialog slot recipe. The overlay spans the full viewport (the iOS WKWebView
 * 100% fix) and the `full` size adds safe-area insets and the brand
 * status-bar gradient.
 *
 * A config recipe (rather than an atomic `sva`) so the `size` variant accepts
 * responsive values, e.g. `{ base: "full", md: "4xl" }`. Consumed by the
 * shared-ui Modal, which maps the slots onto react-aria-components'
 * ModalOverlay / Modal / Dialog.
 *
 * Registered in the base preset (base-preset.ts).
 */
// Appearance of a normal (non-full) modal box. Restated by every non-full size
// variant so that, when `size` is responsive (e.g. { base: "full", md: "4xl" }),
// the larger breakpoint fully overrides the `full` variant rather than leaking
// its margin:0 / border-radius:0 / full-height / gradient into desktop. Panda
// applies the base-breakpoint variant value unconditionally, so symmetric
// property sets across size values are required.
const dialogBox = {
  my: "16",
  mx: "2",
  borderRadius: "md",
  background: "surface.raised",
  minHeight: "auto",
  padding: "0",
};

// The `full` variant also styles these slots; same symmetry requirement.
// The header's padding stays physical to pair with that variant's
// window-controls inset, which is a screen position rather than a
// reading-order one; the base `px` covers the start side either way.
const dialogSlots = {
  header: { pl: "6" },
  body: { overflowY: "visible" },
  closeTrigger: { top: "2" },
};

export const dialog = defineSlotRecipe({
  className: "dialog",
  slots: [
    "overlay",
    "content",
    "inner",
    "header",
    "body",
    "footer",
    "closeTrigger",
  ],
  base: {
    overlay: {
      position: "fixed",
      inset: 0,
      // 100vw, not 100%: react-aria's scroll lock reserves the root
      // scrollbar gutter (scrollbar-gutter: stable), which narrows the
      // containing block for fixed elements — 100% leaves an uncovered
      // strip where the page scrollbar was. Viewport units span the
      // reserved gutter, so the backdrop (and a full-size dialog) reach
      // the real viewport edge.
      w: "100vw",
      h: "100%",
      bg: "surface.overlay",
      zIndex: "modal",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      overflow: "auto",
      overscrollBehaviorY: "none",
      // Fade the backdrop in/out. RAC toggles data-entering/data-exiting and
      // waits for the transition before unmounting.
      opacity: 1,
      transition: "opacity 0.2s ease-out",
      "&[data-entering]": { opacity: 0 },
      "&[data-exiting]": { opacity: 0 },
      _motionReduce: { transition: "none" },
    },
    content: {
      position: "relative",
      color: "inherit",
      boxShadow: "lg",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      outline: "none",
      // Fade + scale enter/exit.
      opacity: 1,
      transform: "scale(1)",
      transition: "opacity 0.2s ease-out, transform 0.2s ease-out",
      "&[data-entering]": { opacity: 0, transform: "scale(0.95)" },
      "&[data-exiting]": { opacity: 0, transform: "scale(0.95)" },
      _motionReduce: { transition: "none" },
    },
    inner: {
      outline: "none",
      display: "flex",
      flexDirection: "column",
      width: "100%",
      flex: "1 1 auto",
    },
    header: {
      px: "6",
      py: "4",
      fontSize: "xl",
      fontWeight: "semibold",
      flexShrink: 0,
    },
    body: { px: "6", py: "2", flex: "1" },
    footer: {
      px: "6",
      py: "4",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      // The gap is house style; override via css for tighter layouts.
      gap: "5",
      flexShrink: 0,
    },
    closeTrigger: { position: "absolute", top: "2", insetEnd: "3" },
  },
  variants: {
    // Vertically centre the dialog in the viewport rather than the default
    // top alignment.
    centered: {
      true: {
        overlay: { alignItems: "center" },
      },
    },
    size: {
      xs: { ...dialogSlots, content: { ...dialogBox, maxWidth: "xs" } },
      sm: { ...dialogSlots, content: { ...dialogBox, maxWidth: "sm" } },
      md: { ...dialogSlots, content: { ...dialogBox, maxWidth: "md" } },
      lg: { ...dialogSlots, content: { ...dialogBox, maxWidth: "lg" } },
      xl: { ...dialogSlots, content: { ...dialogBox, maxWidth: "xl" } },
      "2xl": { ...dialogSlots, content: { ...dialogBox, maxWidth: "2xl" } },
      "3xl": { ...dialogSlots, content: { ...dialogBox, maxWidth: "3xl" } },
      "4xl": { ...dialogSlots, content: { ...dialogBox, maxWidth: "4xl" } },
      "5xl": { ...dialogSlots, content: { ...dialogBox, maxWidth: "5xl" } },
      "6xl": { ...dialogSlots, content: { ...dialogBox, maxWidth: "6xl" } },
      full: {
        content: {
          maxWidth: "100vw",
          minHeight: "100dvh",
          my: "0",
          mx: "0",
          borderRadius: "0",
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
          // brand colour in the status-bar area, white below (matches ActionBar)
          background:
            "linear-gradient(to bottom, token(colors.surface.statusBar) env(safe-area-inset-top), white env(safe-area-inset-top))",
        },
        header: {
          pl: "calc(var(--window-controls-left, 0px) + token(spacing.6))",
        },
        body: { flex: "1", overflowY: "auto" },
        closeTrigger: {
          top: "calc(env(safe-area-inset-top) + token(spacing.2))",
        },
      },
    },
  },
  defaultVariants: { size: "md" },
});
