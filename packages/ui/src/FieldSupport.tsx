/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { HTMLAttributes, ReactNode } from "react";
import {
  FieldError,
  Label as RACLabel,
  LabelProps as RACLabelProps,
  Text as RACText,
} from "react-aria-components";
import { css, cx } from "styled-system/css";
import { field, FieldVariantProps } from "styled-system/recipes";
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
 * `labelPosition` for the four single-control fields (TextField, NumberField,
 * Select, ComboBox). Deliberately not on RadioGroup/CheckboxGroup: their roots
 * carry no layout, and RAC's own `orientation` prop is a different axis there
 * (it lays out the radios, not the label).
 */
export interface FieldLayoutProps {
  /**
   * `side` puts the label beside the control — the settings-row pattern. The
   * label absorbs the free space; the control keeps its own width, so give it
   * one (`groupCss`, `wrapperCss` or `css` depending on the field). Helper
   * and error text drop to a full-width line below the pair.
   */
  labelPosition?: FieldVariantProps["labelPosition"];
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
  labelPosition,
}: FieldSupportProps & FieldLayoutProps) => {
  const slots = field({ labelPosition });
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

interface FieldTextProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** The field's `labelPosition`, so the text lays out to match. */
  labelPosition?: FieldVariantProps["labelPosition"];
  /** Per-instance style overrides. */
  css?: SystemStyleObject;
}

/**
 * Context-free helper text (Chakra's FormHelperText) for a control react-aria
 * isn't wiring — a native select or a masked input. Inside a RAC field
 * container use `FieldSupport`, which wires `aria-describedby` and validation
 * for free; here the caller owns that wiring: give this an `id` and reference
 * it from the control's `aria-describedby` (as `NativeSelectField` does).
 */
export const FieldHelperText = ({
  children,
  labelPosition,
  css: cssProp,
  ...rest
}: FieldTextProps) => (
  <div
    {...rest}
    className={cx(
      field({ labelPosition }).helperText,
      cssProp ? css(cssProp) : undefined,
    )}
  >
    {children}
  </div>
);

/**
 * Context-free error message (Chakra's FormErrorMessage), the counterpart to
 * `FieldHelperText` — see its note on the wiring the caller owns. RAC's
 * `FieldError` renders only while its field is invalid; here that decision is
 * the caller's too: render it conditionally.
 */
export const FieldErrorMessage = ({
  children,
  labelPosition,
  css: cssProp,
  ...rest
}: FieldTextProps) => (
  <div
    {...rest}
    className={cx(
      field({ labelPosition }).errorMessage,
      cssProp ? css(cssProp) : undefined,
    )}
  >
    {children}
  </div>
);

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
  /** The field's `size`, so the label scales with its control. */
  size?: FieldVariantProps["size"];
  /** The field's `labelPosition`, so the label lays out to match. */
  labelPosition?: FieldVariantProps["labelPosition"];
  /** Per-instance style overrides. */
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
  size,
  labelPosition,
  css: cssProp,
  ...rest
}: FieldLabelProps) => (
  <RACLabel
    {...rest}
    className={cx(
      field({ size, labelPosition }).label,
      cssProp ? css(cssProp) : undefined,
    )}
  >
    {children}
    {isRequired ? <FieldRequiredIndicator /> : null}
  </RACLabel>
);
