/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ComponentProps, forwardRef } from "react";
import { styled } from "styled-system/jsx";

const StyledDivider = styled("hr", {
  base: {
    border: 0,
    borderColor: "gray.200",
    opacity: 0.6,
  },
  variants: {
    orientation: {
      horizontal: {
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
        width: "100%",
      },
      vertical: {
        borderLeftWidth: "1px",
        borderLeftStyle: "solid",
        height: "100%",
      },
    },
  },
  defaultVariants: { orientation: "horizontal" },
});

export interface DividerProps extends ComponentProps<typeof StyledDivider> {}

/**
 * Divider — a hairline rule matching Chakra's <Divider> (60% opacity; set
 * `borderColor` to tint). `orientation="vertical"` needs a height from the
 * layout, e.g. a stretched flex row (Chakra's vertical divider likewise
 * relied on `height: 100%`).
 */
export const Divider = forwardRef<HTMLHRElement, DividerProps>(
  function Divider(props, ref) {
    return (
      <StyledDivider
        ref={ref}
        aria-orientation={
          props.orientation === "vertical" ? "vertical" : "horizontal"
        }
        {...props}
      />
    );
  },
);
