/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
} from "react";
import { TooltipTriggerStateContext } from "react-aria-components";
import { css } from "styled-system/css";
import { SystemStyleObject } from "styled-system/types";
import { Button } from "./Button";
import { Tooltip, TooltipProps } from "./Tooltip";
import { VisuallyHidden } from "./VisuallyHidden";

// A tooltip whose text *is* the point of the control — an information affordance
// beside a heading, say — rather than a hint about what a button does. That
// difference drives everything here, because react-aria's tooltips are built for
// the second case:
//
// - They never open on press, since a tooltip isn't a touch pattern. Sighted
//   touch users would have no way in, so this toggles on press.
// - Their text is associated with the trigger only while open, so touch screen
//   readers (iPadOS VoiceOver, TalkBack) never reach it. The same text is
//   therefore always present on a visually hidden node, named or described from
//   the button. The visible tooltip is aria-hidden to avoid double announcement.
// - Any key press dismisses them (see Tooltip's shouldCloseOnPress), which for
//   this pattern means a keyboard user can dismiss but never re-open.
//
// Everything else is left to react-aria: it opens on hover and on keyboard
// focus, closes on Escape without disturbing a surrounding dialog, and keeps
// only one tooltip open at a time across the whole document. Hovering the
// tooltip to keep it open relies on Tooltip's non-zero close delay, so don't
// pass `closeDelay={0}` through to it.

// How far outside the tooltip the pointer still counts as on it, covering the
// trigger/tooltip gap and the arrow.
const pointerMarginPx = 12;

const triggerStyle: SystemStyleObject = {
  // The button recipe's size variants set a height and horizontal padding for
  // text buttons; shrink to the glyph so the focus ring is an even circle
  // around it and the control doesn't stretch its row.
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: "auto",
  minHeight: "0",
  minWidth: "0",
  padding: "0",
  lineHeight: "1",
  cursor: "pointer",
  borderRadius: "50%",
  _focusVisible: { focusShadow: "outline" },
};

export interface TooltipButtonProps {
  /**
   * Tooltip body. Also the button's accessible name, or its description when
   * `aria-label` is given.
   */
  label: ReactNode;
  /** Button content, typically an `Icon`. */
  children: ReactNode;
  /**
   * Short accessible name for the button, e.g. "Live graph". Recommended when
   * `label` runs to more than a few words: without it the whole body becomes
   * the button's name, which a screen reader reads out in full.
   */
  "aria-label"?: string;
  placement?: TooltipProps["placement"];
  hasArrow?: boolean;
  /** Style overrides for the tooltip, e.g. padding for a multi-line body. */
  css?: SystemStyleObject;
  /** Style overrides for the button. */
  triggerCss?: SystemStyleObject;
}

/**
 * TooltipButton — a small button, usually an icon, whose tooltip carries
 * information the user needs rather than a hint about an action.
 *
 * Unlike a bare `Tooltip` it works by pointer, keyboard and touch, and its text
 * reaches screen readers on every platform. Use it for an information icon
 * beside a heading or a "partially supported" marker; use `Tooltip` for a hint
 * on a button that does something else.
 *
 * Open question: react-spectrum makes this pattern a popover
 * (`ContextualHelp`), not a tooltip, which would remove the hidden copy of the
 * body and the pointer-geometry keep-alive below rather than work around them.
 * Tracked as microbit-foundation/ui#63, which would deprecate this component;
 * prefer that direction over extending it.
 */
export const TooltipButton = ({
  label,
  children,
  "aria-label": ariaLabel,
  placement,
  hasArrow,
  css: cssProp,
  triggerCss,
}: TooltipButtonProps) => {
  const textId = useId();
  const tooltipBodyId = useId();
  return (
    <Tooltip
      label={
        <div id={tooltipBodyId} aria-hidden={true}>
          {label}
        </div>
      }
      placement={placement}
      hasArrow={hasArrow}
      css={cssProp}
      // The tooltip is this button's whole explanation — an icon with a 1.5s
      // wait before anything appears reads as broken — so opt out of the warmup
      // the labelled controls want.
      delay={0}
      shouldCloseOnPress={false}
    >
      <span className={css({ display: "flex" })}>
        <TooltipButtonTrigger
          aria-label={ariaLabel}
          textId={textId}
          tooltipBodyId={tooltipBodyId}
          css={triggerCss}
        >
          {children}
        </TooltipButtonTrigger>
        <VisuallyHidden as="div" id={textId} aria-hidden={true}>
          {label}
        </VisuallyHidden>
      </span>
    </Tooltip>
  );
};

interface TooltipButtonTriggerProps {
  children: ReactNode;
  "aria-label"?: string;
  /** Visually hidden copy of the body, naming or describing the button. */
  textId: string;
  /** The body inside the visible tooltip, used to find it in the document. */
  tooltipBodyId: string;
  css?: SystemStyleObject;
}

/**
 * The button itself, split out so it can read the tooltip's state from context.
 * Being a RAC component it registers itself as the tooltip's trigger — hover,
 * focus and positioning all follow from that, even nested inside the span.
 */
const TooltipButtonTrigger = ({
  children,
  "aria-label": ariaLabel,
  textId,
  tooltipBodyId,
  css: cssProp,
}: TooltipButtonTriggerProps) => {
  const state = useContext(TooltipTriggerStateContext);
  const ref = useRef<HTMLButtonElement>(null);
  const handlePress = useCallback(() => {
    if (state?.isOpen) {
      state.close(true);
    } else {
      state?.open(true);
    }
  }, [state]);
  // Hovering the tooltip keeps it open, so it can be read at magnification
  // (WCAG 1.4.13). react-aria does that by re-opening on hover, which fails
  // when the tooltip is portalled into a container a modal has marked inert:
  // it is painted but can never be the target of a mouse event. Pointer
  // geometry works either way — open() clears the pending close.
  //
  // Leaving the tooltip has to close it here too. The trigger's own hover-end
  // fired long ago, when the pointer set off across the gap, so nothing else
  // will. Not while the trigger is hovered or focused, though: those are
  // react-aria's own reasons to be open, and it will close on its own terms.
  const isOpen = state?.isOpen;
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const listener = (e: MouseEvent) => {
      const rect = document
        .getElementById(tooltipBodyId)
        ?.closest('[role="tooltip"]')
        ?.getBoundingClientRect();
      const onTooltip =
        !!rect &&
        e.clientX >= rect.left - pointerMarginPx &&
        e.clientX <= rect.right + pointerMarginPx &&
        e.clientY >= rect.top - pointerMarginPx &&
        e.clientY <= rect.bottom + pointerMarginPx;
      if (onTooltip) {
        state?.open(true);
      } else if (
        ref.current !== document.activeElement &&
        !ref.current?.matches(":hover")
      ) {
        state?.close();
      }
    };
    document.addEventListener("mousemove", listener);
    return () => document.removeEventListener("mousemove", listener);
  }, [isOpen, state, tooltipBodyId]);
  return (
    <Button
      ref={ref}
      variant="unstyled"
      aria-label={ariaLabel}
      // Without a short name the body is the name; with one it is the
      // description. react-aria overwrites aria-describedby with the visible
      // tooltip's id while open, and that copy is aria-hidden so announces
      // nothing; closed — the state a touch screen reader is in — this applies.
      aria-labelledby={ariaLabel ? undefined : textId}
      aria-describedby={ariaLabel ? textId : undefined}
      onPress={handlePress}
      css={{ ...triggerStyle, ...cssProp }}
    >
      {children}
    </Button>
  );
};
