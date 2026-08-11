/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { styled } from "styled-system/jsx";

/**
 * VisuallyHidden — screen-reader-only content (Panda's `srOnly` utility).
 * Renders a span; use `as="div"` for block children.
 */
export const VisuallyHidden = styled("span", {
  base: { srOnly: true },
});
