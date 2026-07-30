/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { forwardRef, InputHTMLAttributes } from "react";
import { css, cx } from "styled-system/css";
import { input, InputVariantProps } from "styled-system/recipes";
import { SystemStyleObject } from "styled-system/types";

export interface InputProps
  // `size` is the recipe's size scale, as in Chakra; the native character-count
  // attribute it shadows was unused.
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "size">,
    InputVariantProps {
  /** Per-instance style overrides, merged after the recipe. */
  css?: SystemStyleObject;
  className?: string;
}

/**
 * Input — a native input styled like Chakra's outline Input. For a
 * labelled field with help/error text use TextField instead.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { size, css: cssProp, className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cx(
        input({ size }),
        cssProp ? css(cssProp) : undefined,
        className,
      )}
      {...rest}
    />
  );
});
