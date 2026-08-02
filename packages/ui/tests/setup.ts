/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

// jsdom (29.x) ships no global CSS object, but react-aria's selection code
// calls CSS.escape when a collection mounts, so any test rendering a Menu,
// ListBox or GridList throws without this. Real browsers all have it.
if (typeof globalThis.CSS === "undefined") {
  (globalThis as { CSS?: unknown }).CSS = {};
}
if (typeof CSS.escape !== "function") {
  // Enough for the identifiers react-aria generates; not a spec implementation.
  CSS.escape = (value: string) =>
    String(value).replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`);
}
