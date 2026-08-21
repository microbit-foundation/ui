/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { styled } from "styled-system/jsx";
import { link } from "styled-system/recipes";

/**
 * Link — a styled anchor, underlined by default (see Link.recipe.ts).
 * Pass `variant="standalone"` for links whose context already shows they
 * are links. Accepts Panda style props for colour etc.
 */
export const Link = styled("a", link);
