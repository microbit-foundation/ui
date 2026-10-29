/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { defineSlotRecipe } from "@pandacss/dev";

/**
 * SplitView slot recipe — two panes either side of a draggable separator.
 * Consumed by SplitView.tsx.
 *
 * Orientation and drag state come from data attributes the component sets
 * (`data-orientation`, `data-dragging`) rather than variants, so there is
 * nothing runtime-selected and no `staticCss` entry is needed.
 *
 * The separator's look is meant to be restyled per app via its `css` prop:
 * the grip inherits `color`, so one override tints both.
 *
 * Registered in the base preset (base-preset.ts).
 */
export const splitView = defineSlotRecipe({
  className: "splitView",
  slots: ["root", "pane", "separator", "grip"],
  base: {
    root: {
      display: "flex",
      width: "100%",
      "&[data-orientation=vertical]": {
        flexDirection: "column",
      },
      // useMove cancels the pointerdown, but on desktop only marks the
      // separator itself unselectable; this stops a drag over either pane
      // selecting its text.
      "&[data-dragging]": {
        userSelect: "none",
      },
      "&[data-dragging][data-orientation=horizontal]": {
        cursor: "col-resize",
      },
      "&[data-dragging][data-orientation=vertical]": {
        cursor: "row-resize",
      },
    },
    pane: {
      // The primary pane's size is an inline style; the secondary takes the
      // rest. Zero minimums let the secondary shrink below its content's
      // intrinsic size, which flex items otherwise refuse to do.
      "&[data-primary]": {
        flex: "none",
      },
      "&:not([data-primary])": {
        flex: "1 1 0",
        minWidth: 0,
        minHeight: 0,
      },
      // An iframe pane (the Python Editor's simulator) would swallow the
      // pointer events of a drag that crosses it.
      "[data-dragging] > &": {
        pointerEvents: "none",
      },
      "&[data-collapsed]": {
        visibility: "hidden",
      },
    },
    separator: {
      position: "relative",
      // Paint the focus ring over the following pane.
      zIndex: 1,
      flex: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      bg: "gray.100",
      color: "blackAlpha.800",
      touchAction: "none",
      outline: "none",
      "&[data-orientation=horizontal]": {
        width: "2.5",
        cursor: "col-resize",
      },
      "&[data-orientation=vertical]": {
        height: "2.5",
        cursor: "row-resize",
      },
      _focusVisible: {
        focusRing: "outline",
      },
      // A 10px bar is a small touch target; widen the hit area to 24px
      // without changing the drawn width. Coarse pointers only, so a mouse
      // keeps reaching the scrollbars at the panes' edges.
      "@media (pointer: coarse)": {
        "&::before": {
          content: '""',
          position: "absolute",
        },
        "&[data-orientation=horizontal]::before": {
          insetBlock: 0,
          insetInline: "-7px",
        },
        "&[data-orientation=vertical]::before": {
          insetInline: 0,
          insetBlock: "-7px",
        },
      },
    },
    grip: {
      width: "6",
      height: "6",
      flex: "none",
      color: "inherit",
      pointerEvents: "none",
      "[data-orientation=vertical] > &": {
        transform: "rotate(90deg)",
      },
    },
  },
});
