/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { styled } from "styled-system/jsx";

/**
 * InputGroup — relative wrapper for an Input with addon elements. Pad the
 * input (`pl`/`pr`) to make room for the elements. Replaces Chakra's
 * InputGroup.
 */
export const InputGroup = styled("div", {
  base: { position: "relative", width: "100%", display: "flex" },
});

// The element styles are written out twice rather than shared via a spread:
// Panda's extractor only reliably evaluates inline literals.
// The size variants are square boxes matching the input recipe's height per
// size, as in Chakra; pass the same `size` as the grouped Input.

/** Element overlaying the start of an InputGroup (Chakra InputLeftElement). */
export const InputLeftElement = styled("div", {
  base: {
    position: "absolute",
    top: 0,
    left: 0,
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

/** Element overlaying the end of an InputGroup (Chakra InputRightElement). */
export const InputRightElement = styled("div", {
  base: {
    position: "absolute",
    top: 0,
    right: 0,
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
