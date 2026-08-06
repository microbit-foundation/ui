/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ReactNode } from "react";
import {
  Radio as RACRadio,
  RadioProps as RACRadioProps,
  RadioGroup as RACRadioGroup,
  RadioGroupProps as RACRadioGroupProps,
} from "react-aria-components";
import { css, cx } from "styled-system/css";
import { radio, RadioVariantProps } from "styled-system/recipes";
import { SystemStyleObject } from "styled-system/types";
import { FieldLabel, FieldSupport, FieldSupportProps } from "./FieldSupport";

export interface RadioGroupProps
  extends Omit<RACRadioGroupProps, "className" | "style">,
    FieldSupportProps {
  /**
   * Visible label for the group (Chakra's FormLabel above it). Use
   * `aria-label` instead where the design has none.
   */
  label?: ReactNode;
  /** Per-instance style overrides, merged after the recipe. */
  css?: SystemStyleObject;
  className?: string;
}

/**
 * RadioGroup — react-aria-components <RadioGroup> for a set of Radios. Beyond
 * the optional field chrome (label/helperText/errorMessage — Chakra's
 * FormControl parts) it carries no styling of its own: compose with Stack for
 * layout, as Chakra call sites did.
 */
export const RadioGroup = ({
  label,
  helperText,
  errorMessage,
  helperTextCss,
  css: cssProp,
  className,
  children,
  ...rest
}: RadioGroupProps) => {
  return (
    <RACRadioGroup
      className={cx(cssProp ? css(cssProp) : undefined, className)}
      {...rest}
    >
      {(renderProps) => (
        <>
          {label != null && (
            <FieldLabel isRequired={rest.isRequired}>{label}</FieldLabel>
          )}
          {typeof children === "function" ? children(renderProps) : children}
          <FieldSupport
            helperText={helperText}
            errorMessage={errorMessage}
            helperTextCss={helperTextCss}
          />
        </>
      )}
    </RACRadioGroup>
  );
};

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
