/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ReactNode } from "react";
import {
  RadioGroup as RACRadioGroup,
  RadioGroupProps as RACRadioGroupProps,
} from "react-aria-components";
import { css, cx } from "styled-system/css";
import { SystemStyleObject } from "styled-system/types";
import { FieldLabel, FieldSupport, FieldSupportProps } from "./Field";

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
