/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { defineSlotRecipe } from "@pandacss/dev";

/**
 * Field slot recipe — Chakra's FormControl parts (FormLabel/FormHelperText/
 * FormErrorMessage, light mode), mapped onto react-aria-components'
 * Label/Text/FieldError by `FieldLabel` and `FieldSupport`. Every labelled
 * field in the library draws its chrome from here, including Select and
 * ComboBox, whose own recipe styles only the dropdown pair; the input itself is
 * styled by the `input` recipe (Input.recipe.ts).
 *
 * Registered in the base preset (base-preset.ts). No variants, so it
 * needs no `staticCss` entry.
 */
export const field = defineSlotRecipe({
  className: "field",
  slots: ["root", "label", "requiredIndicator", "helperText", "errorMessage"],
  base: {
    root: {
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      width: "100%",
    },
    label: {
      display: "block",
      fontSize: "md",
      fontWeight: "medium",
      marginEnd: "3",
      mb: "2",
      transitionProperty: "opacity",
      transitionDuration: "normal",
      // RAC stamps `data-disabled` on the field root and on the control, never
      // on the label, so an `&[data-disabled]` rule here matches nothing — it
      // has to come down from the root (gotcha #45). Direct child rather than a
      // descendant selector, as the select recipe's invalid rule: an app's own
      // disabled form wrapper must not be able to dim every label inside it.
      "[data-disabled] > &": { opacity: 0.4 },
    },
    requiredIndicator: {
      marginStart: "1",
      color: "danger.500",
    },
    helperText: {
      // RAC's Text renders a span, and RadioGroup/CheckboxGroup roots are not
      // flex containers to blockify it, where an inline box would drop the
      // margin below (gotcha #44).
      display: "block",
      mt: "2",
      fontSize: "sm",
      lineHeight: "normal",
      color: "gray.600",
    },
    errorMessage: {
      display: "flex",
      alignItems: "center",
      mt: "2",
      fontSize: "sm",
      lineHeight: "normal",
      color: "danger.500",
    },
  },
});
