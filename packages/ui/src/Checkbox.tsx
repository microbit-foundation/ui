/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ReactNode, useId } from "react";
import {
  Checkbox as RACCheckbox,
  CheckboxProps as RACCheckboxProps,
} from "react-aria-components";
import { useIntl } from "react-intl";
import { css, cx } from "styled-system/css";
import { checkbox, CheckboxVariantProps } from "styled-system/recipes";
import { SystemStyleObject } from "styled-system/types";
import { FieldHelperText } from "./Field";
import { uiMessage } from "./messages";

/** What a render-prop child is told about the checkbox. */
export interface CheckboxState {
  isSelected: boolean;
  isFocusVisible: boolean;
  isDisabled: boolean;
}

export interface CheckboxProps
  extends Omit<RACCheckboxProps, "className" | "children" | "style">,
    CheckboxVariantProps {
  /** Per-instance style overrides for the root, merged after the recipe. */
  css?: SystemStyleObject;
  className?: string;
  /**
   * The label. A function receives the checkbox's state, for a label that
   * changes with it.
   */
  children?: ReactNode | ((state: CheckboxState) => ReactNode);
  /**
   * Whether to draw the box. `false` is for a checkbox whose children draw
   * the selected state themselves — a selectable tile, or an avatar that
   * grows a tick. The label wrapper goes with it, so the children own the
   * whole row, including the focus ring the box would otherwise carry.
   *
   * @default true
   */
  control?: boolean;
  /**
   * Help text below the checkbox, wired to its `aria-describedby` — the same
   * chrome the labelled fields' `helperText` renders. With it the component
   * gains a wrapping `<div>`, so the checkbox-plus-text moves as one block.
   */
  helperText?: ReactNode;
  /** Per-instance style overrides for the helper text. */
  helperTextCss?: SystemStyleObject;
}

/**
 * Checkbox — a styled react-aria-components <Checkbox>. Children render as
 * the label; wrap them in a visually-hidden span for icon-less checkboxes.
 */
export const Checkbox = ({
  size,
  css: cssProp,
  className,
  children,
  control,
  helperText,
  helperTextCss,
  ...rest
}: CheckboxProps) => {
  const slots = checkbox({ size });
  const helperId = useId();
  const intl = useIntl();
  const describedBy =
    [rest["aria-describedby"], helperText != null ? helperId : undefined]
      .filter(Boolean)
      .join(" ") || undefined;
  // Default name for a row-selection checkbox (a GridList row's). A future
  // Table's select-all header checkbox shares the slot name and will need a
  // different label.
  const ariaLabel =
    rest["aria-label"] ??
    (rest.slot === "selection"
      ? intl.formatMessage(uiMessage("ui.select-row-action"))
      : undefined);
  const checkboxElement = (
    <RACCheckbox
      className={cx(slots.root, cssProp ? css(cssProp) : undefined, className)}
      {...rest}
      aria-label={ariaLabel}
      aria-describedby={describedBy}
    >
      {({ isSelected, isFocusVisible, isDisabled }) => {
        const content =
          typeof children === "function"
            ? children({ isSelected, isFocusVisible, isDisabled })
            : children;
        if (control === false) {
          return content;
        }
        return (
          <>
            <span
              className={slots.control}
              data-selected={isSelected || undefined}
              data-focus-visible={isFocusVisible || undefined}
              data-disabled={isDisabled || undefined}
              aria-hidden
            >
              {isSelected && (
                <svg viewBox="0 0 12 10" className={slots.icon} aria-hidden>
                  <polyline
                    points="1.5 6 4.5 9 10.5 1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            {content != null && (
              <span
                className={slots.label}
                data-disabled={isDisabled || undefined}
              >
                {content}
              </span>
            )}
          </>
        );
      }}
    </RACCheckbox>
  );
  if (helperText == null) {
    return checkboxElement;
  }
  return (
    <div>
      {checkboxElement}
      <FieldHelperText id={helperId} css={helperTextCss}>
        {helperText}
      </FieldHelperText>
    </div>
  );
};
