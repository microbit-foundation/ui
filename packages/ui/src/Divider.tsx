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
    borderColor: "border.default",
    opacity: 0.6,
  },
  variants: {
    orientation: {
      horizontal: {
        borderBottomStyle: "solid",
        width: "100%",
      },
      vertical: {
        borderLeftStyle: "solid",
        height: "100%",
      },
    },
    // Rule weight, on the orientation's drawn edge (see compoundVariants).
    // Semantic rather than a raw border width so call sites don't need to
    // know which edge an orientation draws with.
    thickness: {
      thin: {},
      thick: {},
    },
  },
  compoundVariants: [
    {
      orientation: "horizontal",
      thickness: "thin",
      css: { borderBottomWidth: "1px" },
    },
    {
      orientation: "horizontal",
      thickness: "thick",
      css: { borderBottomWidth: "2px" },
    },
    {
      orientation: "vertical",
      thickness: "thin",
      css: { borderLeftWidth: "1px" },
    },
    {
      orientation: "vertical",
      thickness: "thick",
      css: { borderLeftWidth: "2px" },
    },
  ],
  defaultVariants: { orientation: "horizontal", thickness: "thin" },
});

export interface DividerProps extends ComponentProps<typeof StyledDivider> {}

/**
 * Divider — a hairline rule (60% opacity; set `borderColor` to tint,
 * `thickness="thick"` for a 2px rule).
 * `orientation="vertical"` needs a height from the layout, e.g. a stretched
 * flex row.
 *
 * Decorative by default: hidden from assistive tech, since a visual rule
 * between sections is noise as an announced separator (and every call site
 * was opting out by hand). Pass `aria-hidden={false}` for a divider that
 * should be exposed as a semantic separator.
 */
export const Divider = forwardRef<HTMLHRElement, DividerProps>(
  function Divider(props, ref) {
    return (
      <StyledDivider
        ref={ref}
        aria-hidden
        aria-orientation={
          props.orientation === "vertical" ? "vertical" : "horizontal"
        }
        {...props}
      />
    );
  },
);
