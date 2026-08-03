/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

/**
 * The `data-*` entries of a props object, for components that let a caller
 * put test hooks on an inner element rather than the one their props land on.
 *
 * Internal: not exported from the package.
 */
export const dataAttrs = (props: object): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(props).filter(([key]) => key.startsWith("data-")),
  );
