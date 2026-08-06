/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { forwardRef, ReactNode, useId } from "react";
import { css, cx } from "styled-system/css";
import { field } from "styled-system/recipes";
import { SystemStyleObject } from "styled-system/types";
import { FieldHelperText, FieldLabel, FieldLayoutProps } from "./Field";
import { NativeSelect, NativeSelectProps } from "./NativeSelect";

export interface NativeSelectFieldProps
  extends NativeSelectProps,
    FieldLayoutProps {
  /** Visible label, associated with the select via `htmlFor`. */
  label: ReactNode;
  /** Help text below the field, wired to the select's `aria-describedby`. */
  helperText?: ReactNode;
  /** Per-instance style overrides for the field root. */
  rootCss?: SystemStyleObject;
}

/**
 * NativeSelectField — a labelled `NativeSelect`, pairing the bare control with
 * the field chrome the RAC fields get from react-aria, as `TextField` pairs
 * with `Input`. The label association and `aria-describedby` are wired here,
 * since there is no RAC context to do it; the label dims with the control
 * exactly as the RAC fields' do. No `errorMessage` yet — no consumer needs
 * one; render `FieldErrorMessage` beside it if yours does.
 *
 * With `labelPosition="side"` this is the settings row both
 * `SelectFormControl`s hand-rolled: label beside a fixed-width select
 * (`wrapperCss={{ width: "28ch" }}`), label absorbing the free space.
 */
export const NativeSelectField = forwardRef<
  HTMLSelectElement,
  NativeSelectFieldProps
>(function NativeSelectField(
  { label, helperText, labelPosition, rootCss, id, ...rest },
  ref,
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const helperId = useId();
  const describedBy =
    [rest["aria-describedby"], helperText != null ? helperId : undefined]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <div
      className={cx(
        field({ size: rest.size, labelPosition }).root,
        rootCss ? css(rootCss) : undefined,
      )}
      // The field recipe's label dims off the root's data-disabled, which RAC
      // stamps for the other fields; here it is restated from the attribute.
      data-disabled={rest.disabled || undefined}
    >
      <FieldLabel
        htmlFor={selectId}
        size={rest.size}
        labelPosition={labelPosition}
        isRequired={rest.required}
      >
        {label}
      </FieldLabel>
      <NativeSelect
        ref={ref}
        id={selectId}
        {...rest}
        aria-describedby={describedBy}
      />
      {helperText != null && (
        <FieldHelperText id={helperId} labelPosition={labelPosition}>
          {helperText}
        </FieldHelperText>
      )}
    </div>
  );
});
