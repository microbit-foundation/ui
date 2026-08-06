/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { defineSlotRecipe } from "@pandacss/dev";

/**
 * NumberField slot recipe — Chakra's NumberInput look: an outline input (the
 * `input` recipe styles the input itself) with a right-hand stepper column of
 * two stacked buttons. Consumed by the shared-ui NumberField
 * (react-aria-components NumberField).
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
    },
    // Chakra's NumberInputStepper: a column overlaying the input's right
    // edge, inset by the input border.
    stepper: {
      display: "flex",
      flexDirection: "column",
      position: "absolute",
      insetEnd: "0",
      top: "0",
      height: "calc(100% - 2px)",
      margin: "1px",
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
      borderColor: "gray.200",
      transitionProperty: "background",
      transitionDuration: "ultra-fast",
      "&:last-child": {
        borderTop: "1px solid",
        borderTopColor: "gray.200",
        marginTop: "-1px",
      },
      "&[data-hovered]": { bg: "gray.100" },
      "&[data-pressed]": { bg: "gray.200" },
      "&[data-disabled]": { opacity: 0.4, cursor: "not-allowed" },
    },
  },
  variants: {
    // Chakra's NumberInput: the stepper column stays 24px wide at every size
    // (as does the input padding paired with it in NumberField.tsx); only the
    // arrow glyphs scale, at 0.75 × the field's font size. The base's `xs` is
    // exactly md × 0.75, so md adds nothing.
    size: {
      lg: {
        stepperButton: { fontSize: "calc(token(fontSizes.lg) * 0.75)" },
      },
      md: {},
      sm: {
        stepperButton: { fontSize: "calc(token(fontSizes.sm) * 0.75)" },
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
