/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { styled } from "styled-system/jsx";

/**
 * Code — inline code chip matching Chakra's <Code> (gray subtle, light mode).
 */
export const Code = styled("code", {
  base: {
    fontFamily: "mono",
    fontSize: "sm",
    px: "0.2em",
    borderRadius: "sm",
    bg: "gray.100",
    color: "gray.800",
  },
});
