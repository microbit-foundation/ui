/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { defineRecipe } from "@pandacss/dev";

// The common transition-property list, inlined (Panda has no
// transitionProperty token category).
// No box-shadow: nothing in this recipe uses one, and the focus ring's
// layers must never fade in.
const transitionCommon =
  "background-color, border-color, color, fill, stroke, opacity, transform";

/**
 * Input recipe — the outline text field with an sm/md/lg size scale. Used by
 * the shared-ui Input and NativeSelect, and by TextField's input slot.
 *
 * Focus matches both native `:focus-visible` (plain inputs; browsers treat any
 * focus in a text field as focus-visible) and react-aria's `data-focused`
 * (inputs inside RAC TextField).
 *
 * Hover, invalid and focus all set `borderColor`, so their precedence has to be
 * hover < invalid < focus. Declaration order will not buy that: Panda sorts a
 * recipe's state rules itself, ranking selectors against a fixed
 * link/visited/focus/hover/active table, which puts `_hover` *after* focus and
 * after anything the table doesn't mention (`[data-invalid]`). Equal-specificity
 * rules then leave hover winning. So the ladder is spelled with repeated `&`
 * instead — `&&` and `&&&` emit `.input.input` and `.input.input.input`, making
 * precedence specificity rather than order, which nothing downstream can
 * resort. Variants still override freely; they land in a later cascade layer.
 *
 * Registered in the base preset (base-preset.ts), which also has the
 * `staticCss` entry that keeps the runtime-prop size variants generated.
 */
export const input = defineRecipe({
  className: "input",
  base: {
    width: "100%",
    minWidth: 0,
    outline: "none",
    position: "relative",
    appearance: "none",
    font: "inherit",
    transitionProperty: transitionCommon,
    transitionDuration: "normal",
    // 2px like S2's fields (and our Checkbox/Radio): focus changes only
    // the border's colour, so the stroke must carry its full weight at
    // rest — a 1px border made the pointer-focus state half the weight of
    // the old border+shadow treatment.
    border: "2px solid",
    // The accessible outline stops: gray.400 is the ramp's 3:1-on-white
    // boundary grey (WCAG 1.4.11), and hover steps darker, never lighter.
    borderColor: "gray.400",
    bg: "inherit",
    color: "inherit",
    _hover: { borderColor: "gray.500" },
    // hover < focused < invalid, as a specificity ladder (repeated `&`):
    // Panda sorts state rules by its own pseudo-class table, not
    // declaration order, so borderColor ties can't rely on position.
    //
    // Any focus — pointer included — takes the border to the dark brand
    // `focusBorder`: the quiet "you are here" alongside the caret (S2
    // darkens via isFocusWithin; we add the brand tint). Red keeps the
    // border when invalid and focused apply together; the keyboard ring
    // below is disjoint and composes.
    "&&:is(:focus, [data-focused])": { borderColor: "focusBorder" },
    // Border colour alone — the 2px border carries the weight, and the
    // non-colour cue is the field's error message (WCAG 1.4.1), as S2.
    "&&&:is([data-invalid], :user-invalid)": {
      borderColor: "danger.500",
    },
    // The standard family ring, keyboard focus only: react-aria's
    // data-focus-visible treats text inputs specially — pointer focus
    // never sets it, and while typing only Tab/Escape do. Native
    // :focus-visible is deliberately not matched: for text inputs the
    // native heuristic fires on any focus, click included. zIndex so the
    // ring paints over attached-group neighbours.
    "&&&[data-focus-visible]": {
      zIndex: 1,
      focusShadow: "outline",
    },
    "&:is(:disabled, [data-disabled])": {
      opacity: 0.4,
      cursor: "not-allowed",
    },
  },
  variants: {
    // The sm/md/lg size scale.
    size: {
      lg: { fontSize: "lg", px: "4", h: "12", borderRadius: "md" },
      md: { fontSize: "md", px: "4", h: "10", borderRadius: "md" },
      sm: { fontSize: "sm", px: "3", h: "8", borderRadius: "sm" },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
