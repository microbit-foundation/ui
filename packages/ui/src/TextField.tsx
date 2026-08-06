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
import { FieldLabel, FieldSupport, FieldSupportProps } from "./FieldSupport";

export interface TextFieldProps
  extends Omit<
      RACTextFieldProps,
      "className" | "children" | "style" | "onFocus" | "onBlur"
    >,
    InputVariantProps,
    FieldSupportProps {
  /** Visible label (Chakra's FormLabel; asterisk added when `isRequired`). */
  label: ReactNode;
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
      helperText,
      errorMessage,
      helperTextCss,
      onFocus,
      autoCapitalize,
      ...props
    },
    ref,
  ) {
    // As Input: forward every recipe variant group, not just `size`, so a
    // preset that adds one keeps working.
    const [variantProps, rest] = input.splitVariantProps(props);
    const slots = field({ size: variantProps.size });
    return (
      <RACTextField {...rest} className={slots.root}>
        <FieldLabel size={variantProps.size} isRequired={rest.isRequired}>
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
        />
      </RACTextField>
    );
  },
);
