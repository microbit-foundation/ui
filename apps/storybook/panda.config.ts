/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { basePreset } from "@microbit/ui/base-preset";
import { defineConfig, type Preset } from "@pandacss/dev";
import path from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Panda bundles this config into a `data:` URL module, where no specifier has
 * a base to resolve against: everything loaded at config time must therefore
 * be either a static import (bundled in) or an absolute file URL. A static
 * import is no good for the stacks — they live in sibling repos a contributor
 * need not have checked out — hence the absolute-URL dynamic imports, resolved
 * against the cwd (this directory; the storybook:<stack> scripts run here).
 * Node type-strips the TypeScript (Node >= 24).
 *
 * Paths cannot come from the module's own URL instead: it is undefined in the
 * bundled module, and a config that so much as names that `import.meta`
 * property — in a comment included — goes through a Panda plugin that parses
 * it as plain JavaScript, which the type annotations below then fail.
 */
const importFile = async (spec: string): Promise<unknown> => {
  let mod: unknown = await import(
    pathToFileURL(path.resolve(process.cwd(), spec)).href
  );
  while (mod && typeof mod === "object" && "default" in mod) {
    mod = mod.default;
  }
  return mod;
};

/**
 * UI_PRESET_STACK: optional name of a consuming app's preset stack (defined in
 * load-extra-presets.ts) to append to the preset stack, so the Storybook can
 * be viewed with that app's Panda config — use the storybook:<stack> npm
 * scripts. An env var because it has to travel from the npm script to both
 * codegen and the PostCSS plugin, which each load this config; one variable
 * switches the whole build.
 */
const { STACKS } = (await importFile("./load-extra-presets.ts")) as {
  STACKS: Record<string, { presets: string[] }>;
};
const stackName = process.env.UI_PRESET_STACK;
if (stackName && !STACKS[stackName]) {
  throw new Error(
    `Unknown preset stack "${stackName}"; expected one of: ${Object.keys(STACKS).join(", ")}`,
  );
}
const extraPresets = (await Promise.all(
  (stackName ? STACKS[stackName].presets : []).map(importFile),
)) as Preset[];

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
  presets: ["@pandacss/preset-base", basePreset, ...extraPresets],
  include: [
    "../../packages/ui-carousel/src/**/*.{ts,tsx}",
    "../../packages/ui-carousel/stories/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
    "../../packages/ui/stories/**/*.{ts,tsx}",
    "../../packages/ui-patterns/src/**/*.{ts,tsx}",
    "../../packages/ui-patterns/stories/**/*.{ts,tsx}",
  ],
  outdir: "styled-system",
});
