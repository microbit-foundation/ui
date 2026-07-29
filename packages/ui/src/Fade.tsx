/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ReactNode } from "react";
import { css, cx } from "styled-system/css";
import { SystemStyleObject } from "styled-system/types";

export interface FadeProps {
  /** Visible when true; faded out (but mounted) when false. */
  isOpen: boolean;
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
  css: cssProp,
  className,
  children,
}: FadeProps) => (
  <div
    data-open={isOpen ? "" : undefined}
    className={cx(
      css(
        {
          opacity: 0,
          pointerEvents: "none",
          "&[data-open]": { opacity: 1, pointerEvents: "auto" },
          transitionProperty: "opacity",
          transitionDuration: "0.2s",
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
