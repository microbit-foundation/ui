/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { basePreset } from "@microbit/ui/base-preset";
import { defineConfig } from "@pandacss/dev";

/**
 * Package-local Panda config, used only for standalone `tsc` (it generates
 * the styled-system/ output the sources import). Nothing generated is
 * shipped; consumers run their own codegen over this package's sources
 * alongside @microbit/ui's (see README). Stories are rendered by the
 * Storybook in apps/storybook, whose Panda config includes this package.
 */
export default defineConfig({
  preflight: true,
  jsxFramework: "react",
  eject: true,
  presets: ["@pandacss/preset-base", basePreset],
  include: ["./src/**/*.{ts,tsx}", "./stories/**/*.{ts,tsx}"],
  outdir: "styled-system",
});
