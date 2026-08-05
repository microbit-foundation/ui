/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { styled } from "styled-system/jsx";

/**
 * Mark — semantic <mark> matching Chakra's: the browser's yellow highlight
 * removed and the marked run kept on one line, with the visual treatment left
 * to the call site (e.g. `fontWeight="bold"` from a react-intl rich-text
 * chunk handler, the family's common use).
 */
export const Mark = styled("mark", {
  base: {
    bg: "transparent",
    whiteSpace: "nowrap",
  },
});
