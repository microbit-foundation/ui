/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { cva } from "styled-system/css";

// Keeps the glyph centred and spaced 0.5rem from the label. Shared by Button
// and LinkButton; deliberately not exported from the package index.
export const buttonIcon = cva({
  base: {
    display: "inline-flex",
    alignSelf: "center",
    flexShrink: 0,
  },
  variants: {
    side: {
      start: { marginEnd: "2" },
      end: { marginStart: "2" },
    },
  },
});
