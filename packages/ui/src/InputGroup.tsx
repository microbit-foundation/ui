/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { styled } from "styled-system/jsx";

/**
 * InputGroup — relative wrapper for an Input with addon elements. Pad the
 * input (`ps`/`pe`) to make room for the elements; the elements sit on the
 * reading-order sides, so physical padding lands opposite them in RTL.
 */
export const InputGroup = styled("div", {
  base: { position: "relative", width: "100%", display: "flex" },
});

// The element styles are written out twice rather than shared via a spread:
// Panda's extractor only reliably evaluates inline literals.
// The size variants are square boxes matching the input recipe's height per
// size; pass the same `size` as the grouped Input.

/** Element overlaying the start of an InputGroup. */
export const InputStartElement = styled("div", {
  base: {
    position: "absolute",
    top: 0,
    insetStart: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  variants: {
    size: {
      lg: { width: "12", height: "12" },
      md: { width: "10", height: "10" },
      sm: { width: "8", height: "8" },
    },
  },
  defaultVariants: { size: "md" },
});

/** Element overlaying the end of an InputGroup. */
export const InputEndElement = styled("div", {
  base: {
    position: "absolute",
    top: 0,
    insetEnd: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  variants: {
    size: {
      lg: { width: "12", height: "12" },
      md: { width: "10", height: "10" },
      sm: { width: "8", height: "8" },
    },
  },
  defaultVariants: { size: "md" },
});
