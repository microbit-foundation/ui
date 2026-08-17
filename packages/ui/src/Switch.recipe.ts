/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { defineSlotRecipe } from "@pandacss/dev";

/**
 * Switch slot recipe with an sm/md/lg size scale. The track has a 2px inset;
 * the thumb matches the track height and slides by the track width/height
 * difference when selected.
 *
 * State styling keys off data attributes stamped by the shared-ui Switch
 * (react-aria provides the state via render props).
 *
 * Registered in the base preset (base-preset.ts), which also has the
 * `staticCss` entry that keeps the runtime-prop size variants generated.
 */
export const switchRecipe = defineSlotRecipe({
  className: "switch",
  slots: ["root", "track", "thumb", "label"],
  base: {
    root: {
      display: "inline-flex",
      alignItems: "center",
      verticalAlign: "top",
      cursor: "pointer",
      position: "relative",
      "&[data-disabled]": { cursor: "not-allowed" },
    },
    track: {
      display: "inline-flex",
      flexShrink: 0,
      justifyContent: "flex-start",
      boxSizing: "content-box",
      borderRadius: "full",
      p: "0.5",
      transitionProperty: "background-color",
      transitionDuration: "fast",
      bg: "gray.300",
      "&[data-selected]": {
        bg: "controlCheckedBg",
      },
      "&[data-focus-visible]": {
        focusRing: "outline",
      },
      "&[data-disabled]": { opacity: 0.4 },
      // Forced-colors modes strip author backgrounds, flattening track and
      // thumb to the same colour; a border keeps the track visible and the
      // system SelectedItem pair conveys on/off.
      _forcedColors: {
        borderWidth: "1px",
        borderStyle: "solid",
        "&[data-selected]": { bg: "SelectedItem" },
      },
    },
    thumb: {
      bg: "white",
      transitionProperty: "transform",
      transitionDuration: "normal",
      borderRadius: "inherit",
      // The thumb rests at the track's start and slides to its end, so the
      // travel has to reverse in RTL — a transform is physical however the
      // rest of the switch is laid out. Distance is per size, below.
      // Fallbacks carry a unit: `calc(-1 * 0)` is a number, which is invalid
      // where a length is wanted, and would drop the RTL transform whole.
      "&[data-selected]": {
        transform: "translateX(var(--switch-travel, 0px))",
      },
      _rtl: {
        "&[data-selected]": {
          transform: "translateX(calc(-1 * var(--switch-travel, 0px)))",
        },
      },
      _forcedColors: {
        bg: "ButtonText",
        "&[data-selected]": { bg: "SelectedItemText" },
      },
    },
    label: {
      userSelect: "none",
      marginStart: "2",
      "&[data-disabled]": { opacity: 0.4 },
    },
  },
  variants: {
    // `start` puts the label first and the control at the row's end — the
    // settings-row pattern (a preference name beside its switch), the toggle
    // counterpart of the field recipe's `labelPosition="side"`. Values are
    // start/end rather than top/side because the default label is already
    // beside the control, after it. The label keeps an end margin so a long
    // translation can't butt against the track (the SelectFormControl
    // lesson — see the field-chrome roadmap bullet).
    labelPosition: {
      end: {},
      start: {
        root: {
          flexDirection: "row-reverse",
          justifyContent: "space-between",
          width: "100%",
        },
        label: { marginStart: "0", marginEnd: "3" },
      },
    },
    // Track width x height per size; the thumb's travel is the difference
    // between them.
    size: {
      sm: {
        track: { width: "1.375rem", height: "3" },
        thumb: { width: "3", height: "3", "--switch-travel": "0.625rem" },
      },
      md: {
        track: { width: "1.875rem", height: "4" },
        thumb: { width: "4", height: "4", "--switch-travel": "0.875rem" },
      },
      lg: {
        track: { width: "2.875rem", height: "6" },
        thumb: { width: "6", height: "6", "--switch-travel": "1.375rem" },
      },
    },
  },
  defaultVariants: {
    size: "md",
    labelPosition: "end",
  },
});
