/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { defineSlotRecipe } from "@pandacss/dev";

/**
 * NumberField slot recipe — an outline input (the `input` recipe styles the
 * input itself) with a right-hand stepper column of two stacked buttons.
 * Consumed by the shared-ui NumberField (react-aria-components NumberField).
 *
 * Registered in the base preset (base-preset.ts), which also has the
 * `staticCss` entry that keeps the runtime-prop size variants generated.
 */
export const numberField = defineSlotRecipe({
  className: "numberField",
  slots: ["root", "group", "stepper", "stepperButton"],
  base: {
    // No layout here: the component wears the `field` recipe's root alongside
    // this slot, and that recipe is the single owner of field-root layout
    // (else `labelPosition` would fight this slot over `flexDirection`). The
    // slot stays for apps and variants to target.
    root: {},
    group: {
      position: "relative",
      zIndex: 0,
      // The stepper overlays the input as a sibling, so the input's own
      // :hover misses it — the group carries the hover tint. The :not()
      // list is required: slot recipes layer above plain recipes
      // (recipes.slots), so this would otherwise override focused/invalid
      // (see docs/hints.md). :user-invalid takes its own :not(): :not() is
      // not forgiving, so one list would drop the whole selector on a
      // browser that doesn't know the pseudo-class (Safari < 16.5).
      "&:hover input:not(:focus, [data-focused], [data-invalid]):not(:user-invalid)":
        { borderColor: "border.controlHover" },
    },
    // A column overlaying the input's right edge, inset by the input border.
    stepper: {
      display: "flex",
      flexDirection: "column",
      position: "absolute",
      insetEnd: "0",
      top: "0",
      height: "calc(100% - 4px)",
      margin: "2px",
      width: "6",
      zIndex: 1,
    },
    stepperButton: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
      cursor: "pointer",
      lineHeight: "normal",
      fontSize: "xs",
      color: "inherit",
      bg: "transparent",
      borderStart: "1px solid",
      borderColor: "border.default",
      transitionProperty: "background",
      transitionDuration: "ultra-fast",
      // Follow the input's corners, less the 2px border the stepper is inset
      // by, so the hover and pressed fills curve away with the border instead
      // of squaring off over its arc. Radii track the input recipe's size
      // scale, so the `sm` variant restates them.
      "&:first-child": {
        borderStartEndRadius: "calc(token(radii.md) - 2px)",
      },
      "&:last-child": {
        borderTop: "1px solid",
        borderTopColor: "border.default",
        marginTop: "-1px",
        borderEndEndRadius: "calc(token(radii.md) - 2px)",
      },
      "&[data-hovered]": { bg: "surface.highlight" },
      "&[data-pressed]": { bg: "surface.active" },
      "&[data-disabled]": { opacity: 0.4, cursor: "not-allowed" },
    },
  },
  variants: {
    // The stepper column stays 24px wide at every size (as does the input
    // padding paired with it in NumberField.tsx); only the arrow glyphs
    // scale, at 0.75 × the field's font size. The base's `xs` is exactly
    // md × 0.75, so md adds nothing.
    size: {
      lg: {
        stepperButton: { fontSize: "calc(token(fontSizes.lg) * 0.75)" },
      },
      md: {},
      sm: {
        stepperButton: {
          fontSize: "calc(token(fontSizes.sm) * 0.75)",
          "&:first-child": {
            borderStartEndRadius: "calc(token(radii.sm) - 2px)",
          },
          "&:last-child": {
            borderEndEndRadius: "calc(token(radii.sm) - 2px)",
          },
        },
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
