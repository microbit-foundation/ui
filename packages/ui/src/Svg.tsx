/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { styled } from "styled-system/jsx";

/**
 * Svg — a Panda-styled svg element with Icon's base sizing (1em,
 * inline-block). For custom-path icons; react-icons glyphs use `Icon`.
 * As a styled-factory component its call-site style props are extracted.
 */
export const Svg = styled("svg", {
  base: {
    width: "1em",
    height: "1em",
    display: "inline-block",
    lineHeight: "1em",
    flexShrink: 0,
    verticalAlign: "middle",
  },
});
