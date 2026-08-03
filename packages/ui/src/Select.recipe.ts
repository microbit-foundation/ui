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
 * Registered in the base preset (base-preset.ts).
 */
export const select = defineSlotRecipe({
  className: "select",
  slots: [
    "root",
    "label",
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
    label: {
      fontSize: "md",
      fontWeight: "medium",
      marginEnd: "3",
      mb: "2",
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
      _hover: { borderColor: "gray.300" },
      "&[data-focus-visible]": {
        focusShadow: "outline",
        borderColor: "focusBorder",
      },
      // A ComboBox's control is an input, which is focused whenever it is open.
      "&[data-focused]": { focusShadow: "outline", borderColor: "focusBorder" },
      "&[data-invalid]": { borderColor: "danger.500" },
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
      outline: "none",
      "&[data-focus-visible]": { focusShadow: "outline" },
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
