/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { styled } from "styled-system/jsx";
import { text } from "styled-system/recipes";

/**
 * Text — a paragraph that accepts Panda style props. Use `as` to render a
 * different element (`span`, `div`, `h2`).
 * Backed by the `text` config recipe: `size` picks a type-scale size, and an
 * app preset can extend the recipe's `defaultVariants` to give all its Text
 * a default size (see Text.recipe.ts).
 */
export const Text = styled("p", text);
