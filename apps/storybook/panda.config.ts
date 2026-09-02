/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { basePreset } from "@microbit/ui/base-preset";
import { defineConfig, type Preset } from "@pandacss/dev";
import { execFileSync } from "node:child_process";

/**
 * UI_PRESET_STACK: optional name of a consuming app's preset stack (defined in
 * load-extra-presets.ts) to append to the preset stack, so the Storybook can
 * be viewed with that app's Panda config — use the storybook:<stack> npm
 * scripts. The presets are loaded in a child Node process (see the note in the
 * loader) and arrive here as plain JSON data. An env var because it has to
 * travel from the npm script to both codegen and the PostCSS plugin, which
 * each load this config; one variable switches the whole build.
 */
const extraPresets: Preset[] = process.env.UI_PRESET_STACK
  ? JSON.parse(
      execFileSync(
        process.execPath,
        ["./load-extra-presets.ts", process.env.UI_PRESET_STACK],
        { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
      ),
    )
  : [];

/**
 * Panda config for the Storybook build: one harness for every package in the
 * repo, so each package's sources and stories are included for extraction.
 * The base preset alone is a complete design system, so components render in
 * the OSS default look here (no app or private brand preset) unless
 * UI_PRESET_STACK appends an app's stack.
 */
export default defineConfig({
  preflight: true,
  jsxFramework: "react",
  eject: true,
  presets: ["@pandacss/preset-base", basePreset, ...extraPresets],
  include: [
    "../../packages/carousel/src/**/*.{ts,tsx}",
    "../../packages/carousel/stories/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
    "../../packages/ui/stories/**/*.{ts,tsx}",
    "../../packages/ui-patterns/src/**/*.{ts,tsx}",
    "../../packages/ui-patterns/stories/**/*.{ts,tsx}",
  ],
  outdir: "styled-system",
});
