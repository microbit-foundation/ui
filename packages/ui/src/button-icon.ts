/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { cva } from "styled-system/css";

// Chakra's ButtonIcon: keeps the glyph centred and spaced from the label
// (iconSpacing 0.5rem). Shared by Button and LinkButton; deliberately not
// exported from the package index.
export const buttonIcon = cva({
  base: {
    display: "inline-flex",
    alignSelf: "center",
    flexShrink: 0,
  },
  variants: {
    side: {
      left: { marginEnd: "2" },
      right: { marginStart: "2" },
    },
  },
});
