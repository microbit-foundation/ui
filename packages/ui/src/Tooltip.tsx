/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ReactElement, ReactNode, RefObject } from "react";
import { Tooltip as RACTooltip, TooltipTrigger } from "react-aria-components";
import { css, cx } from "styled-system/css";
import { tooltip } from "styled-system/recipes";
import { SystemStyleObject } from "styled-system/types";
import { PopoverArrow } from "./PopoverArrow";

export interface TooltipProps {
  /**
   * Tooltip body (Chakra's `label`). Not named `content`: Panda extracts
   * utility-named props with literal values from any JSX component, so a
   * `content` prop taking a string would emit a broken CSS `content` rule.
   */
  label: ReactNode;
  /** A single focusable trigger element (e.g. a Button). */
  children: ReactElement;
  placement?:
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "top start"
    | "top end"
    | "bottom start"
    | "bottom end"
    | "left top"
    | "left bottom"
    | "right top"
    | "right bottom";
  hasArrow?: boolean;
  /** Controlled open state (otherwise hover/focus driven). */
  isOpen?: boolean;
  /**
   * Anchor element for positioning, when the child cannot register itself as
   * the trigger (i.e. it is not a RAC component or `Focusable`).
   */
  triggerRef?: RefObject<HTMLElement | null>;
  /** Hover open delay in ms (RAC default ~1500; pass 0 for instant). */
  delay?: number;
  /**
   * Close delay in ms, defaulting to react-aria's 500.
   *
   * This is what makes a tooltip hoverable, as WCAG 1.4.13 asks: react-aria
   * puts hover handlers on the tooltip that re-open it, but with an immediate
   * close it has unmounted before the pointer can cross the gap. Chakra closed
   * on mouse-out and we matched that at first; a tooltip that vanishes as you
   * reach for it is not worth the parity. Pass 0 where the delay is wrong for a
   * particular control.
   */
  closeDelay?: number;
  /**
   * Whether pressing the trigger closes the tooltip (RAC default true).
   *
   * react-aria binds this to keydown as well as pointerdown, so with the
   * default *any* key press dismisses the tooltip and only hover or focus
   * brings it back. Pass false where the tooltip's text is the point of the
   * control rather than a hint about an action.
   */
  shouldCloseOnPress?: boolean;
  css?: SystemStyleObject;
}

/**
 * Tooltip — react-aria-components TooltipTrigger + Tooltip, styled to match
 * Chakra's dark tooltip. The child must be a focusable element so the tooltip
 * is reachable by keyboard (RAC requirement), unless `triggerRef` provides
 * the anchor and the caller manages open state and keyboard access itself.
 */
export const Tooltip = ({
  label,
  children,
  placement = "top",
  hasArrow,
  isOpen,
  triggerRef,
  delay = 0,
  closeDelay,
  shouldCloseOnPress,
  css: cssProp,
}: TooltipProps) => (
  <TooltipTrigger
    isOpen={isOpen}
    delay={delay}
    closeDelay={closeDelay}
    shouldCloseOnPress={shouldCloseOnPress}
  >
    {children}
    <RACTooltip
      triggerRef={triggerRef}
      placement={placement}
      offset={hasArrow ? 8 : 4}
      className={cx(tooltip(), cssProp ? css(cssProp) : undefined)}
    >
      {hasArrow && <PopoverArrow css={{ "& svg": { fill: "gray.700" } }} />}
      {label}
    </RACTooltip>
  </TooltipTrigger>
);
