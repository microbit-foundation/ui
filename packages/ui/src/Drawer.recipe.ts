/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { defineSlotRecipe } from "@pandacss/dev";

/**
 * Drawer slot recipe — a 20rem (`xs`) side panel. Consumed by the shared-ui
 * Drawer, which maps the slots onto react-aria-components' ModalOverlay /
 * Modal / Dialog.
 *
 * The panel spans the full viewport height, so like the full-size dialog it
 * pads by the safe-area insets and paints the status-bar strip with the
 * brand `statusBarBg` gradient. The inline inset is applied per placement,
 * since only the screen edge the drawer touches needs it, and uses the
 * nav-side safe-area tokens (README: CSS-variable contract) so content can
 * flow under a camera cutout.
 *
 * The enter transition is a decelerating tween; the exit a 0.15s ease-in-out
 * tween.
 *
 * Registered in the base preset (base-preset.ts); `placement` is
 * forwarded as a runtime prop so the variants are generated via `staticCss`.
 */
export const drawer = defineSlotRecipe({
  className: "drawer",
  slots: ["overlay", "content", "inner", "header", "body"],
  base: {
    overlay: {
      position: "fixed",
      inset: 0,
      w: "100%",
      h: "100%",
      bg: "blackAlpha.600",
      zIndex: "modal",
      opacity: 1,
      transition: "opacity 0.2s ease-out",
      "&[data-entering]": { opacity: 0 },
      "&[data-exiting]": { opacity: 0 },
      _motionReduce: { transition: "none" },
    },
    content: {
      position: "fixed",
      top: 0,
      bottom: 0,
      width: "100%",
      maxWidth: "xs",
      maxH: "100dvh",
      color: "inherit",
      // brand colour in the status-bar area, white below (matches the
      // full-size dialog)
      background:
        "linear-gradient(to bottom, token(colors.statusBarBg) token(spacing.safeAreaTop), white token(spacing.safeAreaTop))",
      paddingTop: "safeAreaTop",
      paddingBottom: "safeAreaBottom",
      boxShadow: "lg",
      display: "flex",
      flexDirection: "column",
      outline: "none",
      zIndex: "modal",
      transform: "translateX(0)",
      transition: "transform 0.3s cubic-bezier(0, 0, 0.2, 1)",
      "&[data-exiting]": {
        transition: "transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
      },
      _motionReduce: { transition: "none" },
    },
    inner: {
      outline: "none",
      display: "flex",
      flexDirection: "column",
      width: "100%",
      height: "100%",
    },
    header: {
      px: "6",
      py: "4",
      fontSize: "xl",
      fontWeight: "semibold",
      flexShrink: 0,
    },
    body: {
      px: "6",
      py: "2",
      flex: "1",
      overflow: "auto",
    },
  },
  variants: {
    // Reading-order sides, so a drawer keeps its relationship to the content
    // in an RTL locale rather than its screen position. The slide-out
    // transforms and the safe-area inline padding are physical, so each
    // needs mirroring under `dir=rtl` to track its own screen edge.
    placement: {
      start: {
        content: {
          insetStart: 0,
          paddingLeft: "safeAreaNavLeft",
          "&[data-entering]": { transform: "translateX(-100%)" },
          "&[data-exiting]": { transform: "translateX(-100%)" },
          _rtl: {
            paddingLeft: "0px",
            paddingRight: "safeAreaNavRight",
            "&[data-entering]": { transform: "translateX(100%)" },
            "&[data-exiting]": { transform: "translateX(100%)" },
          },
        },
      },
      end: {
        content: {
          insetEnd: 0,
          paddingRight: "safeAreaNavRight",
          "&[data-entering]": { transform: "translateX(100%)" },
          "&[data-exiting]": { transform: "translateX(100%)" },
          _rtl: {
            paddingRight: "0px",
            paddingLeft: "safeAreaNavLeft",
            "&[data-entering]": { transform: "translateX(-100%)" },
            "&[data-exiting]": { transform: "translateX(-100%)" },
          },
        },
      },
    },
  },
  defaultVariants: { placement: "start" },
});
