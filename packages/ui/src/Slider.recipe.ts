/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { defineSlotRecipe } from "@pandacss/dev";

/**
 * Slider slot recipe — a horizontal slider (3.5-token thumb, 1-token gray.200
 * track, blue filled track). Consumed by the shared-ui Slider, which maps the
 * slots onto react-aria-components' Slider/SliderTrack/SliderThumb.
 *
 * Geometry: the root is thumb-height with NO horizontal padding, the track is
 * absolutely centred inside it at full width, and the thumb overhangs the
 * track ends at 0%/100%. Call sites position overlays (marks, value labels)
 * against that root box. Sizes are tokens, not px, so apps with resized
 * scales (e.g. python-editor's ×0.88) keep proportional geometry.
 *
 * The `mark` slot is hidden until the slider has focus; the reveal lives here
 * so call sites only style the mark's look.
 *
 * Registered in the base preset (base-preset.ts). No variants, so it
 * needs no `staticCss` entry.
 */
export const slider = defineSlotRecipe({
  className: "slider",
  slots: ["root", "track", "filledTrack", "thumb", "mark"],
  base: {
    root: {
      position: "relative",
      display: "block",
      width: "100%",
      // Thumb-height; the track centres inside.
      height: "3.5",
      touchAction: "none",
      "&:focus-within [data-part='mark']": {
        display: "block",
      },
      "&[data-disabled]": {
        opacity: 0.4,
        cursor: "not-allowed",
      },
    },
    track: {
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      left: 0,
      width: "100%",
      height: "1",
      overflow: "hidden",
      borderRadius: "sm",
      bg: "gray.200",
      cursor: "pointer",
      "[data-disabled] &": {
        bg: "gray.300",
        cursor: "default",
      },
    },
    filledTrack: {
      position: "absolute",
      top: 0,
      left: 0,
      height: "100%",
      // Fill colour is set per call site via `filledTrackCss`.
      bg: "brand.500",
    },
    thumb: {
      position: "absolute",
      top: "50%",
      width: "3.5",
      height: "3.5",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      outline: "none",
      zIndex: 1,
      borderRadius: "full",
      bg: "white",
      boxShadow: "base",
      transitionProperty: "transform",
      transitionDuration: "normal",
      "&[data-dragging]": {
        transform: "translate(-50%, -50%) scale(1.15)",
      },
      transform: "translate(-50%, -50%)",
      "&[data-focus-visible]": {
        focusRing: "outline",
      },
      "&[data-disabled]": {
        bg: "gray.300",
      },
    },
    mark: {
      display: "none",
      position: "absolute",
      whiteSpace: "nowrap",
    },
  },
});
