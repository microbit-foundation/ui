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
import { useIntl } from "react-intl";
import { RiArrowDownSFill, RiArrowUpSFill } from "react-icons/ri";
import { css, cx } from "styled-system/css";
import {
  field,
  input,
  InputVariantProps,
  numberField,
} from "styled-system/recipes";
import { SystemStyleObject } from "styled-system/types";
import {
  FieldLabel,
  FieldLayoutProps,
  FieldSupport,
  FieldSupportProps,
} from "./Field";
import { Icon } from "./Icon";
import { uiMessage } from "./messages";

export interface NumberFieldProps
  extends Omit<RACNumberFieldProps, "className" | "children" | "style">,
    InputVariantProps,
    FieldSupportProps,
    FieldLayoutProps {
  /** Visible label (optional; otherwise pass `aria-label`). */
  label?: ReactNode;
  /** Root style overrides (for a label-beside-field row, prefer
   * `labelPosition="side"`). */
  rootCss?: SystemStyleObject;
  /** Label style overrides. */
  labelCss?: SystemStyleObject;
  /** Group (input + steppers) style overrides — set `width` here. */
  groupCss?: SystemStyleObject;
  /** Input style overrides (for sizing, prefer the `size` prop). */
  inputCss?: SystemStyleObject;
}

/**
 * NumberField — react-aria-components <NumberField>: an outline input with a
 * right-hand stepper column. The ref is forwarded to the input element. Value
 * clamping to min/maxValue is handled by react-aria; onChange receives NaN
 * when the field is emptied.
 */
export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(
  function NumberField(
    {
      label,
      helperText,
      errorMessage,
      helperTextCss,
      rootCss,
      labelCss,
      groupCss,
      inputCss,
      labelPosition,
      ...props
    },
    ref,
  ) {
    // As Input: forward every recipe variant group, not just `size`, so a
    // preset that adds one keeps working.
    const [variantProps, rest] = input.splitVariantProps(props);
    const slots = numberField({ size: variantProps.size });
    const fieldSlots = field({ size: variantProps.size, labelPosition });
    const intl = useIntl();
    // Fold the field's name into the stepper labels as react-aria does; the
    // trim eats the leftover space when there is no usable name.
    const fieldLabel =
      rest["aria-label"] ?? (typeof label === "string" ? label : "");
    return (
      <RACNumberField
        incrementAriaLabel={intl
          .formatMessage(uiMessage("ui.numberfield-increase"), { fieldLabel })
          .trim()}
        decrementAriaLabel={intl
          .formatMessage(uiMessage("ui.numberfield-decrease"), { fieldLabel })
          .trim()}
        {...rest}
        className={cx(
          fieldSlots.root,
          slots.root,
          rootCss ? css(rootCss) : undefined,
        )}
      >
        {label != null && (
          <FieldLabel
            size={variantProps.size}
            labelPosition={labelPosition}
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
          labelPosition={labelPosition}
        />
      </RACNumberField>
    );
  },
);
