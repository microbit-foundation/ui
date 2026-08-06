/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { defineSlotRecipe } from "@pandacss/dev";

// Chakra's transition.property.common, inlined (Panda has no transitionProperty
// token category).
const transitionCommon =
  "background-color, border-color, color, fill, stroke, opacity, box-shadow, transform";

/**
 * Select slot recipe — the dropdown pair, shared by `Select` (a listbox behind
 * a button) and `ComboBox` (a listbox behind a text input). One recipe because
 * the two differ only in what the control is: keeping them together is what
 * stops a searchable and a non-searchable picker drifting apart visually.
 *
 * `trigger` is styled from the Chakra outline Input field so a select sits
 * level with a TextField beside it; `content` matches the `menu` recipe's card
 * so every dropdown surface in the family agrees.
 *
 * Apps restyle it through the `variant` group — classroom's `classroom`
 * variant is the rounded pill its join form uses.
 *
 * The label is not a slot here: it comes from the `field` recipe, as every
 * other labelled field's does. The only thing that costs is a per-`variant`
 * label style — restyle the control and let the label match the family.
 *
 * Registered in the base preset (base-preset.ts).
 */
export const select = defineSlotRecipe({
  className: "select",
  slots: [
    "root",
    "trigger",
    "value",
    "indicator",
    "content",
    "list",
    "option",
    "optionIndicator",
    "empty",
  ],
  base: {
    root: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
    },
    trigger: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "2",
      width: "100%",
      minWidth: 0,
      outline: "none",
      appearance: "none",
      font: "inherit",
      textAlign: "start",
      cursor: "pointer",
      transitionProperty: transitionCommon,
      transitionDuration: "normal",
      border: "1px solid",
      borderColor: "gray.200",
      borderRadius: "md",
      bg: "white",
      color: "inherit",
      h: "10",
      px: "4",
      // As the input recipe, so a Select, a NativeSelect and a TextField in one
      // form all tint together on hover. (react-aria's TextField has no hover
      // effect, but matching the family beats matching their docs.)
      _hover: { borderColor: "gray.300" },
      // `data-invalid` lands on the root — and, in a ComboBox, on the input —
      // but never on the trigger: a RAC Button has no validity state, and our
      // ComboBox control is a plain div. So it comes down from the parent.
      // `> &` rather than a descendant selector, so an app's own invalid form
      // wrapper cannot paint every control inside it red.
      //
      // Doubled `&` for the same reason as the input recipe: hover, invalid and
      // focus all set `borderColor`, and Panda sorts state rules by its own
      // pseudo-class table rather than declaration order, so hover would win
      // these ties. The repeated `&` makes the hover < invalid < focus ladder a
      // matter of specificity instead.
      "[data-invalid] > &&": {
        borderColor: "danger.500",
        boxShadow: "0 0 0 1px token(colors.danger.500)",
      },
      // Two focus cases. `data-focus-visible` is Select's button on keyboard
      // focus only (RAC leaves it unset for mouse, matching the react-aria
      // docs' Select). The `:has()` arm is ComboBox: its control is a plain
      // div wrapping an input, so it gets no RAC attributes itself, and as a
      // text field it should show focus on any modality. That arm watches
      // native `:focus` rather than the input's `data-focused`, because
      // react-aria dispatches a synthetic blur at the input whenever virtual
      // focus moves to an option (aria-activedescendant) — which strips RAC's
      // attribute for as long as the list has an active option, real focus
      // never having left. Select's trigger holds no input, so it can't match.
      "&&&[data-focus-visible], &&&:has(input:focus)": {
        boxShadow: "0 0 0 1px token(colors.focusBorder)",
        borderColor: "focusBorder",
        outline: "2px solid transparent",
        outlineOffset: "2px",
      },
      "&[data-disabled]": { opacity: 0.4, cursor: "not-allowed" },
    },
    // Whatever shows the current value: Select's SelectValue, ComboBox's
    // input. One slot for both, so an app restyling the placeholder (say)
    // does not have to know which kind of control it is looking at.
    value: {
      flex: "1",
      minWidth: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      outline: "none",
      bg: "transparent",
      color: "inherit",
      font: "inherit",
      // RAC sets data-placeholder on SelectValue when nothing is chosen; the
      // ComboBox input uses the real placeholder attribute.
      "&[data-placeholder]": { color: "gray.500" },
      _placeholder: { color: "gray.500" },
    },
    indicator: {
      display: "inline-flex",
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.25em",
      color: "inherit",
      // No pointer-events:none here: in a ComboBox this slot is the button
      // that opens the list. Select's is an aria-hidden span inside the
      // trigger, so it needs no help being inert.
      background: "transparent",
      border: "none",
      cursor: "pointer",
      // No focus styling, deliberately: react-aria keeps a ComboBox's toggle
      // button out of the tab order (the input owns the keyboard), so a ring
      // here would only ever be reachable programmatically, and would suggest
      // the chevron is a tab stop. The whole control shows focus instead.
      outline: "none",
    },
    content: {
      // Line the card up with the control, as a select should and as
      // react-select did. `Select` gets this from RAC, whose trigger is the
      // button it measures; `ComboBox` measures its own control and sets the
      // width inline, because RAC's var is the *input's* width there.
      minWidth: "var(--trigger-width)",
      display: "flex",
      flexDirection: "column",
      bg: "white",
      color: "inherit",
      py: "2",
      zIndex: "popover",
      borderRadius: "md",
      borderWidth: "1px",
      borderColor: "gray.200",
      boxShadow: "sm",
      // Matches the menu recipe's fade/scale.
      transformOrigin: "top",
      opacity: 1,
      transform: "scale(1)",
      transition: "opacity 0.1s ease-out, transform 0.1s ease-out",
      "&[data-entering]": { opacity: 0, transform: "scale(0.95)" },
      "&[data-exiting]": { opacity: 0, transform: "scale(0.95)" },
      _motionReduce: { transition: "none" },
    },
    list: {
      outline: "none",
      overflowY: "auto",
    },
    option: {
      display: "flex",
      alignItems: "center",
      gap: "2",
      py: "1.5",
      px: "3",
      cursor: "pointer",
      color: "inherit",
      outline: "none",
      transitionProperty: "background",
      transitionDuration: "ultra-fast",
      transitionTimingFunction: "ease-in",
      "&[data-focused]": { bg: "gray.100" },
      "&[data-pressed]": { bg: "gray.200" },
      "&[data-disabled]": { opacity: 0.4, cursor: "not-allowed" },
    },
    optionIndicator: {
      display: "inline-flex",
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      marginStart: "auto",
      fontSize: "0.8em",
      opacity: 0,
      "[data-selected] &": { opacity: 1 },
    },
    empty: {
      px: "3",
      py: "2",
      color: "gray.600",
    },
  },
});
