/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { forwardRef, ReactNode } from "react";
import {
  Link as RACLink,
  LinkProps as RACLinkProps,
} from "react-aria-components";
import { css, cx } from "styled-system/css";
import { button, ButtonVariantProps } from "styled-system/recipes";
import { SystemStyleObject } from "styled-system/types";
import { buttonIcon } from "./button-icon";

export interface LinkButtonProps
  extends Omit<RACLinkProps, "className" | "children">,
    ButtonVariantProps {
  /** Per-instance style overrides, merged after the recipe. */
  css?: SystemStyleObject;
  className?: string;
  /** Icon rendered before the label. */
  startIcon?: ReactNode;
  /** Icon rendered after the label. */
  endIcon?: ReactNode;
  children?: ReactNode;
}

// Anchors pick up underline styling that buttons never have.
const linkReset = css.raw({
  textDecoration: "none",
  _hover: { textDecoration: "none" },
});

/**
 * LinkButton — a navigation link that looks like a Button.
 * react-aria-components <Link> renders a real anchor
 * (`href`, `target`, new-tab/middle-click semantics preserved) with the same
 * interaction data attributes as Button, so the `button` recipe's
 * hover/press/focus/disabled states apply unchanged.
 *
 * Use for navigation that should read as a call to action (e.g. an external
 * help page presented as a dialog's primary action); use Button for
 * in-page actions.
 */
export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  function LinkButton(
    {
      variant,
      size,
      tone,
      css: cssProp,
      className,
      startIcon,
      endIcon,
      children,
      ...rest
    },
    ref,
  ) {
    return (
      <RACLink
        ref={ref}
        className={cx(
          button({ variant, size, tone }),
          css(linkReset, cssProp),
          className,
        )}
        {...rest}
      >
        {startIcon ? (
          <span className={buttonIcon({ side: "start" })}>{startIcon}</span>
        ) : null}
        {children}
        {endIcon ? (
          <span className={buttonIcon({ side: "end" })}>{endIcon}</span>
        ) : null}
      </RACLink>
    );
  },
);
