/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ReactNode } from "react";
import {
  FieldError,
  Label as RACLabel,
  LabelProps as RACLabelProps,
  Text as RACText,
} from "react-aria-components";
import { css, cx } from "styled-system/css";
import { field } from "styled-system/recipes";
import { SystemStyleObject } from "styled-system/types";

/**
 * The label/helper/error chrome every labelled form field shares — Chakra's
 * FormControl parts, generalised out of TextField so Select, ComboBox,
 * NumberField, RadioGroup and CheckboxGroup carry the same props
 * (data-microbit-org's forms attach helper and error text to all of these).
 */
export interface FieldSupportProps {
  /** Help text below the field (Chakra's FormHelperText). */
  helperText?: ReactNode;
  /** Shown below the field when invalid (Chakra's FormErrorMessage). */
  errorMessage?: ReactNode;
  /** Per-instance style overrides for the helper text. */
  helperTextCss?: SystemStyleObject;
}

/**
 * Helper text and error message for a react-aria field container. Render
 * inside any RAC component with field validation context (TextField, Select,
 * ComboBox, NumberField, RadioGroup, CheckboxGroup) — react-aria wires the
 * description to the input's aria-describedby, and the error renders only
 * while the field is invalid. Also exported for app-side composites built on
 * RAC containers.
 */
export const FieldSupport = ({
  helperText,
  errorMessage,
  helperTextCss,
}: FieldSupportProps) => {
  const slots = field();
  return (
    <>
      {helperText != null && (
        <RACText
          slot="description"
          className={cx(
            slots.helperText,
            helperTextCss ? css(helperTextCss) : undefined,
          )}
        >
          {helperText}
        </RACText>
      )}
      <FieldError className={slots.errorMessage}>{errorMessage}</FieldError>
    </>
  );
};

/**
 * The required-field asterisk (Chakra's FormLabel indicator). Render inside
 * the field's label when `isRequired`; aria-hidden because react-aria already
 * announces requiredness from the input itself.
 */
export const FieldRequiredIndicator = () => (
  <span aria-hidden className={field().requiredIndicator}>
    *
  </span>
);

export interface FieldLabelProps
  extends Omit<RACLabelProps, "className" | "children" | "style"> {
  children: ReactNode;
  /** Adds the required asterisk; pass the field's `isRequired`. */
  isRequired?: boolean;
  /** Per-instance style overrides (e.g. label-beside-field forms). */
  css?: SystemStyleObject;
}

/**
 * A field's visible label (Chakra's FormLabel), asterisk included. Every
 * labelled field in the library renders its label through this, so the `field`
 * recipe is the single answer to what a label looks like — Select and ComboBox
 * previously carried a near-identical `label` slot on the `select` recipe,
 * which is how the two drifted.
 *
 * Also exported for app-side composites: inside a RAC field container the
 * association is automatic, and outside one (a masked or native input) pass
 * `id` and `htmlFor` yourself.
 */
export const FieldLabel = ({
  children,
  isRequired,
  css: cssProp,
  ...rest
}: FieldLabelProps) => (
  <RACLabel
    {...rest}
    className={cx(field().label, cssProp ? css(cssProp) : undefined)}
  >
    {children}
    {isRequired ? <FieldRequiredIndicator /> : null}
  </RACLabel>
);
