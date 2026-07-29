/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  CSSProperties,
  ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { css, cx } from "styled-system/css";
import { SystemStyleObject } from "styled-system/types";

export interface CollapseProps {
  /** Expanded when true (Chakra's `in`). */
  isOpen: boolean;
  /** Height when collapsed (Chakra's `startingHeight`). */
  startingHeight?: number | string;
  /**
   * Height when expanded (Chakra's `endingHeight`; defaults to the measured
   * content height, tracked with a ResizeObserver so nested expansion works).
   */
  endingHeight?: number | string;
  /** Remove the content from the DOM once the exit transition finishes. */
  unmountOnExit?: boolean;
  css?: SystemStyleObject;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

const toCssSize = (v: number | string) =>
  typeof v === "number" ? `${v}px` : v;

/**
 * Collapse — Chakra's Collapse transition without framer-motion: the content
 * is measured and the wrapper's height (and opacity, when collapsing to zero)
 * transitions between the collapsed and expanded sizes. Content stays mounted
 * unless `unmountOnExit` is set.
 */
export const Collapse = ({
  isOpen,
  startingHeight = 0,
  endingHeight,
  unmountOnExit = false,
  css: cssProp,
  className,
  style,
  children,
}: CollapseProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [measuredHeight, setMeasuredHeight] = useState<number>();
  // For unmountOnExit: stay in the DOM until the exit transition ends.
  const [present, setPresent] = useState(isOpen);
  if (isOpen && !present) {
    setPresent(true);
  }

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el || endingHeight !== undefined) {
      return;
    }
    setMeasuredHeight(el.scrollHeight);
    const observer = new ResizeObserver(() =>
      setMeasuredHeight(el.scrollHeight),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [endingHeight, present]);

  // Fallback for browsers/edge cases where transitionend doesn't fire.
  useEffect(() => {
    if (!isOpen && unmountOnExit) {
      const timeout = setTimeout(() => setPresent(false), 400);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, unmountOnExit]);

  if (unmountOnExit && !present) {
    return null;
  }

  const expanded =
    endingHeight !== undefined
      ? toCssSize(endingHeight)
      : measuredHeight !== undefined
        ? `${measuredHeight}px`
        : "auto";
  const collapsed = toCssSize(startingHeight);
  const hideWhenCollapsed = collapsed === "0px" || collapsed === "0";

  return (
    <div
      onTransitionEnd={(e) => {
        if (
          !isOpen &&
          unmountOnExit &&
          e.propertyName === "height" &&
          e.target === e.currentTarget
        ) {
          setPresent(false);
        }
      }}
      className={cx(
        css(
          {
            overflow: "hidden",
            display: "block",
            transitionProperty: "height, opacity",
            transitionDuration: "0.25s",
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
            _motionReduce: { transition: "none" },
          },
          cssProp,
        ),
        className,
      )}
      // Runtime-measured/caller-supplied heights.
      style={{
        height: isOpen ? expanded : collapsed,
        opacity: isOpen || !hideWhenCollapsed ? 1 : 0,
        ...style,
      }}
    >
      <div ref={contentRef}>{children}</div>
    </div>
  );
};
