/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ReactNode } from "react";
import {
  Radio as RACRadio,
  RadioProps as RACRadioProps,
} from "react-aria-components";
import { css, cx } from "styled-system/css";
import { radio, RadioVariantProps } from "styled-system/recipes";
import { SystemStyleObject } from "styled-system/types";

export interface RadioProps
  extends Omit<RACRadioProps, "className" | "children" | "style">,
    RadioVariantProps {
  /** Per-instance style overrides for the root, merged after the recipe. */
  css?: SystemStyleObject;
  className?: string;
  children?: ReactNode;
}

/**
 * Radio — react-aria-components <Radio> styled like Chakra's radio. Must be
 * rendered inside a RadioGroup. Children render as the label.
 */
export const Radio = ({
  size,
  css: cssProp,
  className,
  children,
  ...rest
}: RadioProps) => {
  const slots = radio({ size });
  return (
    <RACRadio
      className={cx(slots.root, cssProp ? css(cssProp) : undefined, className)}
      {...rest}
    >
      {({ isSelected, isFocusVisible, isDisabled }) => (
        <>
          <span
            className={slots.control}
            data-selected={isSelected || undefined}
            data-focus-visible={isFocusVisible || undefined}
            data-disabled={isDisabled || undefined}
            aria-hidden
          />
          {children != null && (
            <span
              className={slots.label}
              data-disabled={isDisabled || undefined}
            >
              {children}
            </span>
          )}
        </>
      )}
    </RACRadio>
  );
};
