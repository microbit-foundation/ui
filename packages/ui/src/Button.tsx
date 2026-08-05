/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { forwardRef, ReactNode } from "react";
import { useIntl } from "react-intl";
import {
  Button as RACButton,
  ButtonProps as RACButtonProps,
} from "react-aria-components";
import { css, cx } from "styled-system/css";
import { button, ButtonVariantProps } from "styled-system/recipes";
import { SystemStyleObject } from "styled-system/types";
import { buttonIcon } from "./button-icon";
import { uiMessage } from "./messages";
import { Spinner } from "./Spinner";

// Chakra's ButtonSpinner: a 1em spinner centred over the hidden label. Out of
// flow, so the label alone sets the button's size; the recipe's base
// `position: relative` is what it anchors to. Its own component so useIntl runs
// only while a button is actually loading — a bare Button must keep working
// without an IntlProvider (test renders commonly lack one).
const ButtonSpinner = () => {
  const intl = useIntl();
  return (
    <span
      className={css({
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      })}
    >
      <Spinner
        aria-label={intl.formatMessage(uiMessage("ui.loading"))}
        css={{ width: "1em", height: "1em" }}
      />
    </span>
  );
};

export interface ButtonProps
  extends Omit<RACButtonProps, "className" | "children">,
    ButtonVariantProps {
  /** Per-instance style overrides, merged after the recipe. */
  css?: SystemStyleObject;
  className?: string;
  /** Icon rendered before the label, matching Chakra's `leftIcon`. */
  leftIcon?: ReactNode;
  /** Icon rendered after the label, matching Chakra's `rightIcon`. */
  rightIcon?: ReactNode;
  /**
   * Show a spinner in place of the label and disable interaction, matching
   * Chakra's `isLoading`: the label stays in the layout but invisible, so the
   * button keeps its size, and the dimmed disabled look applies. Chakra's
   * `loadingText`/`spinnerPlacement` (a visible label beside the spinner) are
   * unported — no app in the family used them.
   */
  isLoading?: boolean;
  children?: ReactNode;
}

/**
 * Button — react-aria-components <Button> styled with the `button` config
 * recipe. The recipe's interaction states are driven by RAC's data attributes
 * (see the preset's widened conditions), so disabled/hover/press/focus all work
 * without extra wiring.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant,
      size,
      css: cssProp,
      className,
      leftIcon,
      rightIcon,
      isLoading,
      children,
      ...rest
    },
    ref,
  ) {
    const label = (
      <>
        {leftIcon ? (
          <span className={buttonIcon({ side: "left" })}>{leftIcon}</span>
        ) : null}
        {children}
        {rightIcon ? (
          <span className={buttonIcon({ side: "right" })}>{rightIcon}</span>
        ) : null}
      </>
    );
    return (
      <RACButton
        ref={ref}
        className={cx(
          button({ variant, size }),
          cssProp ? css(cssProp) : undefined,
          className,
        )}
        data-loading={isLoading ? "" : undefined}
        {...rest}
        isDisabled={isLoading || rest.isDisabled}
      >
        {isLoading ? (
          <>
            <ButtonSpinner />
            {/* Hidden with opacity, not removed: it keeps the button the size
                it is when idle, so a row of buttons doesn't reflow. Still in
                the accessibility tree, so the button keeps its name. */}
            <span className={css({ opacity: 0 })}>{label}</span>
          </>
        ) : (
          label
        )}
      </RACButton>
    );
  },
);
