/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { forwardRef } from "react";
import { Button, ButtonProps } from "./Button";

export interface IconButtonProps
  extends Omit<ButtonProps, "startIcon" | "endIcon"> {
  /** Icon-only buttons have no visible label, so this is required. */
  "aria-label": string;
}

/**
 * IconButton — a square, icon-only Button. Zeroes the recipe's horizontal
 * padding (its size variants add `px`, which would squeeze a single glyph in a
 * fixed-width button) and keeps the `minW` from the size so the box stays
 * square. Pass the icon as children.
 *
 * Circular at every size without asking: the 2rem `button` radius exceeds half
 * the tallest size (3rem), so CSS clamps it to a full round. Override
 * `borderRadius` per instance for anything else — an attached group or a
 * button that sits in a card corner needs per-corner control, not a shape flag.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ css: cssProp, children, ...rest }, ref) {
    return (
      <Button ref={ref} css={{ px: 0, ...cssProp }} {...rest}>
        {children}
      </Button>
    );
  },
);
