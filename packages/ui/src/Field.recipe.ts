/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { defineSlotRecipe } from "@pandacss/dev";

/**
 * Field slot recipe — the label/helper/error chrome, mapped onto
 * react-aria-components' Label/Text/FieldError by `FieldLabel` and
 * `FieldSupport`. Every labelled
 * field in the library draws its chrome from here, including Select and
 * ComboBox, whose own recipe styles only the dropdown pair; the input itself is
 * styled by the `input` recipe (Input.recipe.ts).
 *
 * `root` is also the single owner of field-root *layout*: Select, ComboBox and
 * NumberField wear it alongside their own recipe's root slot, which carries no
 * layout of its own — two recipes fighting over `flexDirection` would leave
 * `labelPosition` at the mercy of emission order. RadioGroup and CheckboxGroup
 * deliberately don't wear it (their roots carry no layout at all).
 *
 * Registered in the base preset (base-preset.ts), which also has the
 * `staticCss` entry that keeps the runtime-prop size variants generated.
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
      // Deliberately `normal`, not `medium`: no font in the family's stack
      // has a 500 face (the two render identically on macOS and Windows),
      // and the call sites that cared (settings rows) want `normal`.
      fontWeight: "normal",
      marginEnd: "3",
      mb: "2",
      transitionProperty: "opacity",
      transitionDuration: "normal",
      // RAC stamps `data-disabled` on the field root and on the control, never
      // on the label, so an `&[data-disabled]` rule here matches nothing — it
      // has to come down from the root. Direct child rather than a
      // descendant selector, as the select recipe's invalid rule: an app's own
      // disabled form wrapper must not be able to dim every label inside it.
      "[data-disabled] > &": { opacity: 0.4 },
    },
    requiredIndicator: {
      marginStart: "1",
      // 600 for headroom as text; the invalid border stays 500.
      color: "danger.600",
    },
    helperText: {
      // RAC's Text renders a span, and RadioGroup/CheckboxGroup roots are not
      // flex containers to blockify it, where an inline box would drop the
      // margin below.
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
      // 600: red-as-text needs 4.5:1 (the invalid border stays 500).
      color: "danger.600",
    },
  },
  variants: {
    // The label follows its control's size (the control itself is sized by
    // the `input`/`select` recipes), so one `size` prop scales the whole row.
    // Helper and error text stay `sm` at every size.
    size: {
      lg: { label: { fontSize: "lg" } },
      md: { label: { fontSize: "md" } },
      sm: { label: { fontSize: "sm" } },
    },
    // `side` puts the label beside its control — the settings-row pattern,
    // where the label is a preference name and absorbs the free space. The
    // control keeps its own width; give it one at the call site. Named after
    // React Spectrum's `labelPosition`, not `orientation`, which RAC's
    // RadioGroup already uses for the radios' own layout.
    labelPosition: {
      top: {},
      side: {
        root: {
          flexDirection: "row",
          alignItems: "center",
          // Helper and error text are full-width items, so they wrap to
          // their own line below the label/control pair.
          flexWrap: "wrap",
        },
        // Basis 0, not auto: the wrap container breaks lines on hypothetical
        // sizes, and an auto basis is the label's max-content — a long
        // translated label would push the control onto its own line instead
        // of wrapping its text beside it.
        label: { mb: "0", flex: "1 1 0" },
        helperText: { width: "100%" },
        errorMessage: { width: "100%" },
      },
    },
  },
  defaultVariants: {
    size: "md",
    labelPosition: "top",
  },
});
