/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { HTMLAttributes, ReactNode } from "react";
import { css, cx } from "styled-system/css";
import { SystemStyleObject } from "styled-system/types";

/**
 * The placeholder block, as an object rather than a precomputed class so a
 * caller's `css` is merged into one `css()` call and its overrides win.
 *
 * The colours flow through a pair of custom properties, so a call site can
 * retint one skeleton without knowing how the animation works.
 */
const skeletonBase: SystemStyleObject = {
  "--skeleton-start-color": "token(colors.gray.100)",
  // gray.350, the decorative-fill stop, as the Avatar default.
  "--skeleton-end-color": "token(colors.gray.350)",
  background: "var(--skeleton-start-color)",
  borderColor: "var(--skeleton-end-color)",
  opacity: 0.7,
  borderRadius: "sm",
  boxShadow: "none",
  backgroundClip: "padding-box",
  cursor: "default",
  color: "transparent",
  pointerEvents: "none",
  userSelect: "none",
  // The content is hidden rather than unmounted, so a skeleton sized from
  // real children keeps their dimensions.
  "&::before, &::after, *": { visibility: "hidden" },
  animation:
    "skeletonFade var(--skeleton-speed, 0.8s) linear infinite alternate",
  _motionReduce: { animation: "none" },
};

export interface SkeletonProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  /** Show the children instead of the placeholder. */
  isLoaded?: boolean;
  /** Seconds per pulse (default 0.8). */
  speed?: number;
  children?: ReactNode;
  /** Per-instance style overrides, merged after the base. */
  css?: SystemStyleObject;
  className?: string;
}

/**
 * Skeleton — a loading placeholder: a block pulsing between two greys until
 * its content is ready.
 *
 * Content simply appears when `isLoaded` turns true; wrap in `Fade` where a
 * transition matters.
 */
export const Skeleton = ({
  isLoaded,
  speed,
  children,
  css: cssProp,
  className,
  style,
  ...rest
}: SkeletonProps) => {
  if (isLoaded) {
    return (
      <div
        {...rest}
        style={style}
        className={cx(cssProp ? css(cssProp) : undefined, className)}
      >
        {children}
      </div>
    );
  }
  return (
    <div
      {...rest}
      style={
        speed === undefined
          ? style
          : ({ ...style, "--skeleton-speed": `${speed}s` } as typeof style)
      }
      className={cx(css({ ...skeletonBase, ...cssProp }), className)}
    >
      {children}
    </div>
  );
};

export interface SkeletonTextProps extends SkeletonProps {
  /** How many lines to draw (default 3). */
  noOfLines?: number;
  /** Gap between the lines. Any CSS length. */
  spacing?: string;
  /** Height of each line. Any CSS length. */
  skeletonHeight?: string;
}

/**
 * SkeletonText — a paragraph-shaped `Skeleton`: evenly spaced lines, the last
 * one short.
 */
export const SkeletonText = ({
  noOfLines = 3,
  spacing = "0.5rem",
  skeletonHeight = "0.5rem",
  isLoaded,
  speed,
  children,
  css: cssProp,
  className,
  ...rest
}: SkeletonTextProps) => {
  if (isLoaded) {
    return (
      <div
        {...rest}
        className={cx(cssProp ? css(cssProp) : undefined, className)}
      >
        {children}
      </div>
    );
  }
  return (
    <div
      {...rest}
      className={cx(cssProp ? css(cssProp) : undefined, className)}
    >
      {Array.from({ length: noOfLines }, (_, index) => (
        <Skeleton
          key={index}
          speed={speed}
          style={{
            height: skeletonHeight,
            // The last line is drawn at 80%, with no gap after it.
            width: noOfLines > 1 && index === noOfLines - 1 ? "80%" : "100%",
            marginBottom: index === noOfLines - 1 ? "0" : spacing,
          }}
        />
      ))}
    </div>
  );
};
