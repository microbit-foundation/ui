/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ReactNode } from "react";
import {
  CheckboxGroup as RACCheckboxGroup,
  CheckboxGroupProps as RACCheckboxGroupProps,
} from "react-aria-components";
import { css, cx } from "styled-system/css";
import { SystemStyleObject } from "styled-system/types";
import { FieldLabel, FieldSupport, FieldSupportProps } from "./Field";

export interface CheckboxGroupProps
  extends Omit<RACCheckboxGroupProps, "className" | "style">,
    FieldSupportProps {
  /**
   * Visible label for the group (Chakra's FormLabel above it). Use
   * `aria-label` instead where the design has none.
   */
  label?: ReactNode;
  /** Label style overrides. */
  labelCss?: SystemStyleObject;
  /** Per-instance style overrides. */
  css?: SystemStyleObject;
  className?: string;
}

/**
 * CheckboxGroup — react-aria-components <CheckboxGroup> for a set of
 * Checkboxes sharing one value array (each Checkbox's `value` marks its
 * entry). Beyond the optional field chrome (label/helperText/errorMessage —
 * Chakra's FormControl parts) it carries no styling of its own: compose with
 * Stack for layout, as RadioGroup does. Chakra's CheckboxGroup was a bare
 * context provider, so ported call sites gain the chrome rather than
 * restating it around the group.
 */
export const CheckboxGroup = ({
  label,
  labelCss,
  helperText,
  errorMessage,
  helperTextCss,
  css: cssProp,
  className,
  children,
  ...rest
}: CheckboxGroupProps) => {
  return (
    <RACCheckboxGroup
      className={cx(cssProp ? css(cssProp) : undefined, className)}
      {...rest}
    >
      {(renderProps) => (
        <>
          {label != null && (
            <FieldLabel isRequired={rest.isRequired} css={labelCss}>
              {label}
            </FieldLabel>
          )}
          {typeof children === "function" ? children(renderProps) : children}
          <FieldSupport
            helperText={helperText}
            errorMessage={errorMessage}
            helperTextCss={helperTextCss}
          />
        </>
      )}
    </RACCheckboxGroup>
  );
};
