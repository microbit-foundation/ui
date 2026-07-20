/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { defineConfig } from "@pandacss/dev";
import { basePreset } from "./src/base-preset";

/**
 * Package-local Panda config, used for standalone `tsc` (it generates the
 * styled-system/ output the sources import) and for Storybook. The base
 * preset alone is a complete design system, so components render in the OSS
 * default look here (no app or private brand preset). Nothing generated is
 * shipped; consumers run their own codegen over their full stack (base →
 * optional app preset → optional private brand preset).
 */
export default defineConfig({
  preflight: true,
  jsxFramework: "react",
  eject: true,
  presets: ["@pandacss/preset-base", basePreset],
  include: ["./src/**/*.{ts,tsx}", "./stories/**/*.{ts,tsx}"],
  outdir: "styled-system",
});
