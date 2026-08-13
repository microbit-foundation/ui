/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { defineConfig } from "@pandacss/dev";
import { basePreset } from "./src/base-preset";

/**
 * Package-local Panda config, used for standalone `tsc` and vitest (it
 * generates the styled-system/ output the sources import). Nothing generated
 * is shipped; consumers run their own codegen over their full stack (base →
 * optional app preset → optional private brand preset). The Storybook in
 * apps/storybook has its own config, which includes this package.
 */
export default defineConfig({
  preflight: true,
  jsxFramework: "react",
  eject: true,
  presets: ["@pandacss/preset-base", basePreset],
  include: ["./src/**/*.{ts,tsx}", "./stories/**/*.{ts,tsx}"],
  outdir: "styled-system",
});
