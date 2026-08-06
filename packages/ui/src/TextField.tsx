/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { FocusEvent, forwardRef, ReactNode } from "react";
import {
  Input as RACInput,
  TextField as RACTextField,
  TextFieldProps as RACTextFieldProps,
} from "react-aria-components";
import { field, input, InputVariantProps } from "styled-system/recipes";
import { SystemStyleObject } from "styled-system/types";
import {
  FieldLabel,
  FieldLayoutProps,
  FieldSupport,
  FieldSupportProps,
} from "./Field";

export interface TextFieldProps
  extends Omit<
      RACTextFieldProps,
      "className" | "children" | "style" | "onFocus" | "onBlur"
    >,
    InputVariantProps,
    FieldSupportProps,
    FieldLayoutProps {
  /** Visible label (Chakra's FormLabel; asterisk added when `isRequired`). */
  label: ReactNode;
  /** Label style overrides. */
  labelCss?: SystemStyleObject;
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
  /** Input autocapitalize attribute (react-aria's TextField omits it). */
  autoCapitalize?: "off" | "none" | "on" | "sentences" | "words" | "characters";
}

/**
 * TextField — a labelled single-line text input, collapsing Chakra's
 * FormControl/FormLabel/Input/FormHelperText/FormErrorMessage. The ref is
 * forwarded to the input element.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    {
      label,
      labelCss,
      helperText,
      errorMessage,
      helperTextCss,
      labelPosition,
      onFocus,
      autoCapitalize,
      ...props
    },
    ref,
  ) {
    // As Input: forward every recipe variant group, not just `size`, so a
    // preset that adds one keeps working.
    const [variantProps, rest] = input.splitVariantProps(props);
    const slots = field({ size: variantProps.size, labelPosition });
    return (
      <RACTextField {...rest} className={slots.root}>
        <FieldLabel
          size={variantProps.size}
          labelPosition={labelPosition}
          isRequired={rest.isRequired}
          css={labelCss}
        >
          {label}
        </FieldLabel>
        <RACInput
          ref={ref}
          className={input(variantProps)}
          onFocus={onFocus}
          autoCapitalize={autoCapitalize}
        />
        <FieldSupport
          helperText={helperText}
          errorMessage={errorMessage}
          helperTextCss={helperTextCss}
          labelPosition={labelPosition}
        />
      </RACTextField>
    );
  },
);
