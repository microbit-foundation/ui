/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { forwardRef, ReactNode } from "react";
import {
  Button as RACButton,
  Group as RACGroup,
  Input as RACInput,
  NumberField as RACNumberField,
  NumberFieldProps as RACNumberFieldProps,
} from "react-aria-components";
import { RiArrowDownSFill, RiArrowUpSFill } from "react-icons/ri";
import { css, cx } from "styled-system/css";
import { input, InputVariantProps, numberField } from "styled-system/recipes";
import { SystemStyleObject } from "styled-system/types";
import { FieldLabel, FieldSupport, FieldSupportProps } from "./FieldSupport";
import { Icon } from "./Icon";

export interface NumberFieldProps
  extends Omit<RACNumberFieldProps, "className" | "children" | "style">,
    InputVariantProps,
    FieldSupportProps {
  /** Visible label (optional; otherwise pass `aria-label`). */
  label?: ReactNode;
  /** Root style overrides (e.g. row layout for label-beside-field forms). */
  css?: SystemStyleObject;
  /** Label style overrides. */
  labelCss?: SystemStyleObject;
  /** Group (input + steppers) style overrides — set `width` here. */
  groupCss?: SystemStyleObject;
  /** Input style overrides (for sizing, prefer the `size` prop). */
  inputCss?: SystemStyleObject;
}

/**
 * NumberField — react-aria-components <NumberField> styled like Chakra's
 * NumberInput (outline input + right-hand stepper column). The ref is
 * forwarded to the input element. Value clamping to min/maxValue is
 * handled by react-aria; onChange receives NaN when the field is emptied.
 */
export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(
  function NumberField(
    {
      label,
      helperText,
      errorMessage,
      helperTextCss,
      css: cssProp,
      labelCss,
      groupCss,
      inputCss,
      ...props
    },
    ref,
  ) {
    // As Input: forward every recipe variant group, not just `size`, so a
    // preset that adds one keeps working.
    const [variantProps, rest] = input.splitVariantProps(props);
    const slots = numberField({ size: variantProps.size });
    return (
      <RACNumberField
        {...rest}
        className={cx(slots.root, cssProp ? css(cssProp) : undefined)}
      >
        {label != null && (
          <FieldLabel
            size={variantProps.size}
            isRequired={rest.isRequired}
            css={labelCss}
          >
            {label}
          </FieldLabel>
        )}
        <RACGroup
          className={cx(slots.group, groupCss ? css(groupCss) : undefined)}
        >
          <RACInput
            ref={ref}
            className={cx(
              input(variantProps),
              // Room for the stepper column (constant across sizes, as the
              // stepper's width is).
              css({ paddingEnd: "6" }, inputCss),
            )}
          />
          <div className={slots.stepper}>
            <RACButton slot="increment" className={slots.stepperButton}>
              <Icon as={RiArrowUpSFill} />
            </RACButton>
            <RACButton slot="decrement" className={slots.stepperButton}>
              <Icon as={RiArrowDownSFill} />
            </RACButton>
          </div>
        </RACGroup>
        <FieldSupport
          helperText={helperText}
          errorMessage={errorMessage}
          helperTextCss={helperTextCss}
        />
      </RACNumberField>
    );
  },
);
