/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { styled } from "styled-system/jsx";

/**
 * Unstyled list, matching Chakra's <List>. The marker removal is explicit —
 * Chakra's List set listStyleType itself, and coexisting apps run without
 * Panda's preflight (margins/padding are zeroed by whichever reset is
 * active).
 */
export const List = styled("ul", {
  base: { listStyleType: "none" },
});

/** List item, matching Chakra's <ListItem>. */
export const ListItem = styled("li", {
  base: {},
});

/** Bulleted list matching Chakra's <UnorderedList>. */
export const UnorderedList = styled("ul", {
  base: { listStyleType: "disc", marginStart: "1em" },
});

/** Numbered list matching Chakra's <OrderedList>. */
export const OrderedList = styled("ol", {
  base: { listStyleType: "decimal", marginStart: "1em" },
});
