/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { CSSProperties, ReactNode } from "react";
import { css, cx } from "styled-system/css";
import { SystemStyleObject } from "styled-system/types";

export interface FadeProps {
  /** Visible when true; faded out (but mounted) when false. */
  isOpen: boolean;
  /**
   * Fade-in time in seconds (Chakra's `transition.enter.duration`).
   * Default 0.2, Chakra's.
   */
  enterDuration?: number;
  /** Fade-out time in seconds (Chakra's `transition.exit.duration`). */
  exitDuration?: number;
  css?: SystemStyleObject;
  className?: string;
  children: ReactNode;
}

/**
 * Fade — Chakra's Fade transition as a CSS opacity transition (see Slide for
 * the pattern). Content stays mounted throughout.
 */
export const Fade = ({
  isOpen,
  enterDuration = 0.2,
  exitDuration = 0.2,
  css: cssProp,
  className,
  children,
}: FadeProps) => (
  <div
    data-open={isOpen ? "" : undefined}
    // Runtime values, so an inline custom property rather than the css()
    // object (gotcha #9: a non-literal duration would extract to nothing).
    // The var switches in the same commit as the opacity, so the transition
    // picks up the direction's own duration.
    style={
      {
        "--fade-duration": `${isOpen ? enterDuration : exitDuration}s`,
      } as CSSProperties
    }
    className={cx(
      css(
        {
          opacity: 0,
          pointerEvents: "none",
          "&[data-open]": { opacity: 1, pointerEvents: "auto" },
          transitionProperty: "opacity",
          transitionDuration: "var(--fade-duration)",
          transitionTimingFunction: "ease-out",
          _motionReduce: { transition: "none" },
        },
        cssProp,
      ),
      className,
    )}
  >
    {children}
  </div>
);
