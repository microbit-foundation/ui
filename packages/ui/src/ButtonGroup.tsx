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
 */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  function ButtonGroup({ isAttached, css: cssProp, className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={cx(
          css({
            display: "inline-flex",
            alignItems: "center",
            // Buttons are position: relative, so without this an attached
            // sibling paints over the focused button's focus-ring shadow.
            // Raise only on :focus-visible, when the ring is actually shown:
            // with the attached -1px overlap a raised button also paints over
            // a seam its neighbour draws (e.g. a solid split button's white
            // borderLeft).
            "& > *": { _focusVisible: { zIndex: 1 } },
          }),
          isAttached
            ? css({
                gap: 0,
                // :first-child/:last-child, not :first-of-type: attached
                // groups can mix element types (e.g. select + button), and
                // -of-type matches per element type.
                // marginEnd -1px overlaps adjacent borders so two 1px inner
                // edges read as a single 1px seam. That assumes 1px borders;
                // the bordered variants are 2px (microbit-foundation/ui#22).
                "& > *:first-child:not(:last-child)": {
                  borderEndRadius: 0,
                  marginEnd: "-1px",
                },
                "& > *:not(:first-child):not(:last-child)": {
                  borderRadius: 0,
                  marginEnd: "-1px",
                },
                "& > *:not(:first-child):last-child": {
                  borderStartRadius: 0,
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
