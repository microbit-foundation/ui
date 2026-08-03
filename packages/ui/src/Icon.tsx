/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ComponentType, SVGProps } from "react";
import { css, cx } from "styled-system/css";
import { SystemStyleObject } from "styled-system/types";

/**
 * Any component that renders an `<svg>` from svg props. Deliberately no
 * narrower than the props `Icon` actually passes, so it accepts both
 * react-icons' `IconType` and svgr components (`import X from "./x.svg?react"`,
 * which the apps use for their custom-path icons — Chakra's `<Icon as={…}>`
 * took either).
 */
export type IconComponent = ComponentType<
  Pick<
    SVGProps<SVGSVGElement>,
    "className" | "focusable" | "role" | "aria-label" | "aria-hidden"
  >
>;

export interface IconProps {
  /** The icon component to render: a react-icons glyph or an svgr import. */
  as: IconComponent;
  /** Panda style overrides (size via fontSize/boxSize, colour, etc.). */
  css?: SystemStyleObject;
  className?: string;
  "aria-label"?: string;
  "aria-hidden"?: boolean;
}

/**
 * Icon — renders a react-icons glyph inline at `1em`, matching Chakra's <Icon>
 * base styles. `fill: currentColor` means the glyph follows the surrounding
 * text colour (set `css={{ color: ... }}` to override), so it inherits colour
 * like Chakra's icons rather than defaulting to black.
 *
 * Unlabelled icons are treated as decorative and hidden from assistive tech;
 * a labelled icon gets `role="img"` (a bare svg aria-label is unreliably
 * announced without it).
 */
export const Icon = ({
  as: As,
  css: cssProp,
  className,
  "aria-label": ariaLabel,
  "aria-hidden": ariaHidden,
}: IconProps) => (
  <As
    className={cx(
      css({
        width: "1em",
        height: "1em",
        display: "inline-block",
        lineHeight: "1em",
        flexShrink: 0,
        fill: "currentColor",
        // Chakra's Icon set this on the element itself, and an inline-block
        // icon sits ~3px off without it. Panda's preflight happens to set it
        // on every svg, which hid the omission in apps that had already
        // flipped — classroom measured the difference at its kill-switch,
        // where the preflight arrived and moved every icon back.
        verticalAlign: "middle",
        ...cssProp,
      }),
      className,
    )}
    focusable="false"
    aria-label={ariaLabel}
    aria-hidden={ariaHidden ?? (ariaLabel ? undefined : true)}
    role={ariaLabel ? "img" : undefined}
  />
);
