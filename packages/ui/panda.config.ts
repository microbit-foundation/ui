/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { defineConfig } from "@pandacss/dev";
import { microbitPreset } from "./src/microbit-preset";
import { sharedUiPreset } from "./src/panda-preset";

/**
 * Package-local Panda config, used for standalone `tsc` (it generates the
 * styled-system/ output the sources import) and for Storybook. It stacks the
 * brand-agnostic core preset and the micro:bit foundation preset — the same
 * stack the README tells consumers to assemble, with OSS placeholder brand
 * values — so components typecheck and render realistically here. Nothing
 * generated is shipped; consumers run their own codegen over their full stack
 * (core → foundation → app → optional private brand).
 */
export default defineConfig({
  preflight: true,
  jsxFramework: "react",
  eject: true,
  presets: ["@pandacss/preset-base", sharedUiPreset, microbitPreset],
  include: ["./src/**/*.{ts,tsx}", "./stories/**/*.{ts,tsx}"],
  outdir: "styled-system",
});
