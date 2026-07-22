/*
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 *
 * TEMPORARY compatibility shim for consuming apps that still support Safari
 * below 15. Delete this file (and the app-side wiring — see the README) once
 * every consuming app has raised its support floor past the affected browsers.
 *
 * The bug: Safari 14.x silently drops logical *shorthands* whose value
 * contains var() — `padding-inline: var(--spacing-2)` applies nothing, even
 * though `padding-inline: 10px` (literal) and `padding-inline-start:
 * var(--spacing-2)` (longhand) both work. Panda emits these shorthands for its
 * px/py/mx/my utilities, so the bug removes most token-based spacing.
 *
 * The fix: rewrite the inline/block logical shorthands into their -start/-end
 * longhands. Kept logical (not physical left/right) so RTL still flips.
 *
 * This is one of TWO legacy concerns for the same era of browsers; the other
 * is @layer, which those browsers drop wholesale. Apps also run
 * @csstools/postcss-cascade-layers (de-layering) and pin build.cssTarget — see
 * the "Legacy browser support" section of the README. All of it is expected to
 * be removed together when the floor rises.
 *
 * Exposed as a PostCSS plugin factory:
 *   const { expandLogicalShorthands } = require("@microbit/ui/postcss-legacy-safari");
 *   module.exports = { plugins: [expandLogicalShorthands(), ...] };
 */

// Logical shorthands whose value is `<start> <end>` (one value applies to
// both). NOT included: border-inline / border-block — those are compound
// (`width style color`) and duplicate the whole value to each side rather than
// splitting, so they would need different handling. Add them explicitly if a
// consuming app ever emits them.
const LOGICAL_SHORTHANDS = {
  "padding-inline": ["padding-inline-start", "padding-inline-end"],
  "padding-block": ["padding-block-start", "padding-block-end"],
  "margin-inline": ["margin-inline-start", "margin-inline-end"],
  "margin-block": ["margin-block-start", "margin-block-end"],
  "inset-inline": ["inset-inline-start", "inset-inline-end"],
  "inset-block": ["inset-block-start", "inset-block-end"],
  "scroll-margin-inline": [
    "scroll-margin-inline-start",
    "scroll-margin-inline-end",
  ],
  "scroll-margin-block": [
    "scroll-margin-block-start",
    "scroll-margin-block-end",
  ],
  "scroll-padding-inline": [
    "scroll-padding-inline-start",
    "scroll-padding-inline-end",
  ],
  "scroll-padding-block": [
    "scroll-padding-block-start",
    "scroll-padding-block-end",
  ],
};

// Split a value on top-level whitespace, ignoring spaces inside parens so
// var() fallbacks stay intact. One value applies to both sides; two map to
// start then end (per the CSS shorthand rules).
const splitTopLevel = (value) => {
  const parts = [];
  let depth = 0;
  let current = "";
  for (const ch of value) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (depth === 0 && /\s/.test(ch)) {
      if (current.trim()) parts.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
};

const expandLogicalShorthands = () => ({
  postcssPlugin: "microbit-ui-expand-logical-shorthands",
  Declaration(decl) {
    const longhands = LOGICAL_SHORTHANDS[decl.prop.toLowerCase()];
    if (!longhands) return;
    const parts = splitTopLevel(decl.value);
    if (parts.length === 0) return;
    const [start, end = start] = parts;
    decl.cloneBefore({ prop: longhands[0], value: start });
    decl.cloneBefore({ prop: longhands[1], value: end });
    decl.remove();
  },
});
expandLogicalShorthands.postcss = true;

module.exports = { expandLogicalShorthands };
