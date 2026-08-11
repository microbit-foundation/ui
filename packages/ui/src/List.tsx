/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { styled } from "styled-system/jsx";

/**
 * Unstyled list. The marker removal is explicit rather than relying on a
 * reset.
 */
export const List = styled("ul", {
  base: { listStyleType: "none" },
});

/** List item. */
export const ListItem = styled("li", {
  base: {},
});

/** Bulleted list. */
export const UnorderedList = styled("ul", {
  base: { listStyleType: "disc", marginStart: "1em" },
});

/** Numbered list. */
export const OrderedList = styled("ol", {
  base: { listStyleType: "decimal", marginStart: "1em" },
});
