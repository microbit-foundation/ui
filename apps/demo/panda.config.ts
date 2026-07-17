/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { sharedUiPreset } from "@microbit/ui/panda-preset";
import { microbitPreset } from "@microbit/ui/microbit-preset";
import { defineConfig } from "@pandacss/dev";

/**
 * The reference consumer setup for @microbit/ui (see the package README):
 * the preset stack merged in order (later wins), and the package's shipped
 * source included so Panda extracts the styles its components use. Apps add
 * their own preset (and an optional private brand preset) after the
 * micro:bit foundation preset.
 */
export default defineConfig({
  preflight: true,
  jsxFramework: "react",
  // Drop Panda's default theme; the preset stack supplies the full token
  // system. preset-base still provides the utilities.
  eject: true,
  presets: ["@pandacss/preset-base", sharedUiPreset, microbitPreset],
  include: [
    "./src/**/*.{ts,tsx}",
    // Standalone consumers use "./node_modules/@microbit/ui/src/**/*.{ts,tsx}";
    // in this workspace npm hoists the package to the repo root, so that path
    // does not exist here — include the workspace source directly. Beware:
    // Panda silently extracts nothing from an include glob that matches no
    // files, and recipe styling still works via the preset's staticCss, so a
    // wrong path shows up only as broken non-recipe styling (unsized icons,
    // collapsed fields).
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  outdir: "styled-system",
});
