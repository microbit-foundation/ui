/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ReactNode, useId } from "react";
import {
  Switch as RACSwitch,
  SwitchProps as RACSwitchProps,
} from "react-aria-components";
import { css, cx } from "styled-system/css";
import { switchRecipe, SwitchRecipeVariantProps } from "styled-system/recipes";
import { SystemStyleObject } from "styled-system/types";
import { FieldHelperText } from "./Field";

export interface SwitchProps
  extends Omit<RACSwitchProps, "className" | "children" | "style">,
    SwitchRecipeVariantProps {
  /** Per-instance style overrides for the root, merged after the recipe. */
  css?: SystemStyleObject;
  className?: string;
  children?: ReactNode;
  /**
   * Help text below the switch, wired to its `aria-describedby` — the same
   * chrome the labelled fields' `helperText` renders. With it the component
   * gains a wrapping `<div>`, so the switch-plus-text moves as one block.
   */
  helperText?: ReactNode;
  /** Per-instance style overrides for the helper text. */
  helperTextCss?: SystemStyleObject;
}

/**
 * Switch — react-aria-components <Switch> styled like Chakra's switch.
 * Children render as the label; pass `aria-label` for label-less switches.
 * `labelPosition="start"` is the settings-row layout: label first, switch at
 * the row's end.
 */
export const Switch = ({
  size,
  labelPosition,
  css: cssProp,
  className,
  children,
  helperText,
  helperTextCss,
  ...rest
}: SwitchProps) => {
  const slots = switchRecipe({ size, labelPosition });
  const helperId = useId();
  const describedBy =
    [rest["aria-describedby"], helperText != null ? helperId : undefined]
      .filter(Boolean)
      .join(" ") || undefined;
  const switchElement = (
    <RACSwitch
      className={cx(slots.root, cssProp ? css(cssProp) : undefined, className)}
      {...rest}
      aria-describedby={describedBy}
    >
      {({ isSelected, isFocusVisible, isDisabled }) => {
        const state = {
          "data-selected": isSelected || undefined,
          "data-focus-visible": isFocusVisible || undefined,
          "data-disabled": isDisabled || undefined,
        };
        return (
          <>
            <span className={slots.track} {...state} aria-hidden>
              <span className={slots.thumb} {...state} />
            </span>
            {children != null && (
              <span className={slots.label} {...state}>
                {children}
              </span>
            )}
          </>
        );
      }}
    </RACSwitch>
  );
  if (helperText == null) {
    return switchElement;
  }
  return (
    <div>
      {switchElement}
      <FieldHelperText id={helperId} css={helperTextCss}>
        {helperText}
      </FieldHelperText>
    </div>
  );
};
