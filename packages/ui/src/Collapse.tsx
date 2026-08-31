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
  /** Expanded when true. */
  isOpen: boolean;
  /** Height when collapsed. */
  startingHeight?: number | string;
  /**
   * Height when expanded (defaults to the measured content height, tracked
   * with a ResizeObserver so nested expansion works).
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
 * Collapse — an expand/collapse transition: the content is measured and the
 * wrapper's height (and opacity, when collapsing to zero) transitions between
 * the collapsed and expanded sizes. Content stays mounted unless
 * `unmountOnExit` is set.
 *
 * Only `isOpen` changes animate: initial mounts render at rest, and height
 * corrections (late measurement, content growth) snap — otherwise a collapse
 * mounted inside an entering view morphs during the outer animation.
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
  // The state the DOM shows. It follows isOpen from a layout effect so the
  // transition-enable and the height flip land in the same commit (a
  // render-time flip detector is unreliable: React can discard renders,
  // losing the state update while keeping ref mutations).
  const [displayOpen, setDisplayOpen] = useState(isOpen);
  const [animating, setAnimating] = useState(false);

  useLayoutEffect(() => {
    if (isOpen === displayOpen) {
      return;
    }
    if (isOpen) {
      // Opening: mount (collapsed) first, then flip on the next frame so
      // the browser has a computed collapsed state to transition from.
      // The mount-then-flip sequencing above depends on the effect timing.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPresent(true);
      const raf = requestAnimationFrame(() => {
        setAnimating(true);
        setDisplayOpen(true);
      });
      return () => cancelAnimationFrame(raf);
    }
    // Closing: enable the transition and flip together, pre-paint.
    setAnimating(true);
    setDisplayOpen(false);
  }, [isOpen, displayOpen]);

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
    if (animating) {
      const timeout = setTimeout(() => {
        setAnimating(false);
        if (!isOpen && unmountOnExit) {
          setPresent(false);
        }
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [animating, isOpen, unmountOnExit]);

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
        if (e.propertyName === "height" && e.target === e.currentTarget) {
          setAnimating(false);
          if (!isOpen && unmountOnExit) {
            setPresent(false);
          }
        }
      }}
      className={cx(
        css(
          {
            overflow: "hidden",
            display: "block",
            transitionDuration: "0.25s",
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
            _motionReduce: { transition: "none" },
          },
          cssProp,
        ),
        className,
      )}
      // Runtime-measured/caller-supplied heights; transitions enabled only
      // while an isOpen change is in flight.
      style={{
        transitionProperty: animating ? "height, opacity" : "none",
        height: displayOpen ? expanded : collapsed,
        opacity: displayOpen || !hideWhenCollapsed ? 1 : 0,
        // At rest fully-collapsed, remove the content from the a11y tree
        // and tab order (kept visible while animating so the exit
        // transition shows).
        visibility:
          displayOpen || animating || !hideWhenCollapsed ? undefined : "hidden",
        ...style,
      }}
    >
      <div
        ref={contentRef}
        // flow-root: the measured element must be a block formatting
        // context, or children's margins collapse through it and
        // scrollHeight under-measures — the outer (overflow: hidden)
        // wrapper IS a BFC and needs the full height, so the mismatch
        // clips the last line of margined content (python-editor's API
        // docs). Rendering is unchanged: the margins always displayed
        // inside the outer BFC.
        className={css({ display: "flow-root" })}
      >
        {children}
      </div>
    </div>
  );
};
