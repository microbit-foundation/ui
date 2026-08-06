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
      // Deliberately not Chakra FormLabel's `medium`: no font in the family's
      // stack has a 500 face, so the two were pixel-identical on macOS and
      // Windows, and the only call sites that cared overrode to `normal`
      // (settings rows). See the playbook's expected behavioural deltas.
      fontWeight: "normal",
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
  variants: {
    // The label follows its control's size (the control itself is sized by
    // the `input`/`select` recipes), so one `size` prop scales the whole row.
    // Chakra's FormLabel never scaled — a deliberate delta, decided in
    // docs/form-controls.md. Helper and error text stay `sm` at every size,
    // as Chakra's did.
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
        label: { mb: "0", flex: "1 1 auto" },
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
