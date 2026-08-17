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
  // `size` is the recipe's size scale; the native visible-rows attribute it
  // shadows was unused.
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
   * belong (the select fills it). No wrapper is rendered with `hideChevron`;
   * constrain the select directly.
   */
  wrapperCss?: SystemStyleObject;
  className?: string;
}

/**
 * NativeSelect — a native select styled like the outline Input. The recipe's
 * `appearance: none` removes the platform chevron, so one is drawn back in by
 * default (`currentColor`).
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
            // Option text sits a hair higher than input text; the 1px bottom
            // padding compensates.
            {
              cursor: "pointer",
              paddingBottom: "1px",
              _disabled: { cursor: "not-allowed" },
            },
            // Room for the chevron overlay (constant across sizes).
            hideChevron ? undefined : { paddingEnd: "8" },
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
          // Full-width like every other field; the select's own recipe width
          // fills it. Constrain via wrapperCss.
          { position: "relative", display: "inline-flex", width: "100%" },
          wrapperCss,
        )}
      >
        {select}
        {/* The chevron, fixed-size across field sizes. The path is Chakra
            UI's Select chevron, inlined for visual parity with the apps'
            original look (see the notice in LICENSE.md). */}
        <svg
          viewBox="0 0 24 24"
          aria-hidden
          className={css({
            position: "absolute",
            insetEnd: "2",
            top: "50%",
            transform: "translateY(-50%)",
            width: "5",
            height: "5",
            pointerEvents: "none",
            fill: "currentColor",
            // The chevron sits outside the select so it doesn't inherit its
            // disabled dimming; dim it explicitly to match.
            "select:disabled + &": { opacity: 0.5 },
          })}
        >
          <path d="M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z" />
        </svg>
      </span>
    );
  },
);
