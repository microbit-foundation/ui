/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { forwardRef, SelectHTMLAttributes } from "react";
import { css, cx } from "styled-system/css";
import { input, InputVariantProps } from "styled-system/recipes";
import { SystemStyleObject } from "styled-system/types";

export interface NativeSelectProps
  // `size` is the recipe's size scale, as in Chakra; the native visible-rows
  // attribute it shadows was unused.
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "className" | "size">,
    InputVariantProps {
  /**
   * Suppress the dropdown chevron, e.g. when an adjacent control provides the
   * affordance. Without the chevron a bare <select> element is rendered (no
   * wrapper), so it can participate directly in e.g. an attached ButtonGroup.
   */
  hideChevron?: boolean;
  /** Per-instance style overrides for the select, merged after the recipe. */
  css?: SystemStyleObject;
  /**
   * Style overrides for the chevron wrapper, which is where width constraints
   * belong (the select fills it). Chakra's Select worked the same way: layout
   * props were split onto `.chakra-select__wrapper`, `width: 100%` otherwise.
   * No wrapper is rendered with `hideChevron`; constrain the select directly.
   */
  wrapperCss?: SystemStyleObject;
  className?: string;
}

/**
 * NativeSelect — a native select styled like Chakra's Select field (outline).
 * The recipe's `appearance: none` removes the platform chevron, so one is
 * drawn back in by default (Chakra Select's glyph, `currentColor`).
 */
export const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  function NativeSelect(
    { hideChevron = false, size, css: cssProp, wrapperCss, className, ...rest },
    ref,
  ) {
    const select = (
      <select
        ref={ref}
        className={cx(
          input({ size }),
          css(
            // Chakra's Select field carried a 1px bottom padding its Input
            // didn't (its option text sits a hair higher than input text).
            { cursor: "pointer", paddingBottom: "1px" },
            // Room for the chevron overlay (Chakra Select's icon spacing,
            // constant across sizes).
            hideChevron ? undefined : { paddingRight: "8" },
            cssProp,
          ),
          className,
        )}
        {...rest}
      />
    );
    if (hideChevron) {
      return select;
    }
    return (
      <span
        className={css(
          // Full-width like every other field (and Chakra's select wrapper);
          // the select's own recipe width fills it. Constrain via wrapperCss.
          { position: "relative", display: "inline-flex", width: "100%" },
          wrapperCss,
        )}
      >
        {select}
        {/* Chakra Select's chevron, fixed-size across field sizes. */}
        <svg
          viewBox="0 0 24 24"
          aria-hidden
          className={css({
            position: "absolute",
            right: "2",
            top: "50%",
            transform: "translateY(-50%)",
            width: "5",
            height: "5",
            pointerEvents: "none",
            fill: "currentColor",
            // The chevron sits outside the select so it doesn't inherit its
            // disabled dimming; Chakra's Select icon dimmed to 0.5.
            "select:disabled + &": { opacity: 0.5 },
          })}
        >
          <path d="M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z" />
        </svg>
      </span>
    );
  },
);
