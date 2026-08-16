/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { forwardRef, HTMLAttributes } from "react";
import { css, cx } from "styled-system/css";
import { SystemStyleObject } from "styled-system/types";

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Square the inner radii so adjacent buttons form one control. Otherwise
   * buttons get a small gap.
   */
  isAttached?: boolean;
  /** Per-instance style overrides. */
  css?: SystemStyleObject;
  className?: string;
}

/**
 * ButtonGroup — lays out related buttons in a row. Works with any button
 * elements (shared-ui or native).
 *
 * Attached, the buttons divide by a hairline and the group keeps whatever
 * outline the variant draws round the outside, so a 2px `secondary` reads as
 * one bordered control with cells inside it rather than three boxes. A
 * variant with no border of its own (`primary`, `solid`, `neutral`) divides
 * by a gap in the same place, the surface behind the group showing through —
 * see the `[data-attached]` rule in base-preset.ts.
 */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  function ButtonGroup({ isAttached, css: cssProp, className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        data-attached={isAttached ? "" : undefined}
        className={cx(
          css({
            display: "inline-flex",
            alignItems: "center",
            // Buttons are position: relative, so a sibling would paint over
            // the focused button's ring. Only while it shows: a permanently
            // raised child would own the seam it shares, so a hover on its
            // neighbour would stop short of it.
            "& > *": { _focusVisible: { zIndex: 1 } },
          }),
          isAttached
            ? css({
                gap: 0,
                // :first-child/:last-child, not -of-type: attached groups can
                // mix element types (e.g. select + button).
                //
                // A hairline whatever the variant's border, which stays as the
                // group's outline — matching it made a 2px seam read as a gap
                // (microbit-foundation/ui#22). Both sides of a seam keep a
                // border and overlap by its width so the two paint as one
                // line; dropping one instead would move that button's border
                // box off the cell you see, and `focusRing` is an outline, so
                // the ring would land on the seam rather than outside it.
                //
                // padding-box so a fill doesn't paint under the transparent
                // seam a borderless variant gets from the preset. Here rather
                // than with that rule because `bg` is the `background`
                // shorthand, which resets it from `recipes`.
                "& > *": { backgroundClip: "padding-box" },
                "& > *:not(:last-child)": {
                  borderEndRadius: 0,
                  borderInlineEndWidth: "1px",
                },
                "& > *:not(:first-child)": {
                  borderStartRadius: 0,
                  borderInlineStartWidth: "1px",
                  marginInlineStart: "-1px",
                },
              })
            : css({ gap: 2 }),
          cssProp ? css(cssProp) : undefined,
          className,
        )}
        {...rest}
      />
    );
  },
);
