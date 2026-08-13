/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
/**
 * The consuming-app preset stacks that the storybook:<stack> npm scripts can
 * apply, so the Storybook can be viewed with an app's Panda config. Each stack
 * mirrors the `presets` array of the app's own panda.config.ts (after the
 * shared base preset, which our config always includes). Paths are relative to
 * this package and assume the app repos — including the private brand ones —
 * are checked out as siblings of this repo, with their node_modules installed
 * (the presets import @pandacss/dev).
 *
 * Used two ways: executed directly by panda.config.ts (`node
 * load-extra-presets.ts <stack>`, Node ≥ 24 type-strips it) to print the named
 * stack's presets as JSON — a child process because Panda's own config bundler
 * hooks require() in ways that break loading sibling repos' TypeScript presets
 * in-process, and JSON is sufficient because presets are declarative data —
 * and imported by .storybook/main.ts for the brand font CSS paths.
 */
import path from "node:path";
import { pathToFileURL } from "node:url";

export interface PresetStack {
  /** Preset module paths in the app's own panda.config.ts order. */
  presets: string[];
  /**
   * The app's licensed brand @font-face CSS, for stacks whose font tokens
   * name faces the OSS repo cannot ship. Inlined into the preview by the
   * plugin in .storybook/main.ts.
   */
  fontCss?: string;
}

export const STACKS: Record<string, PresetStack> = {
  python: {
    presets: [
      "../../packages/ui/src/dense-preset.ts",
      "../../../python-editor-v3/src/deployment/default/panda-preset.ts",
      "../../../python-editor-v3-microbit/src/panda-preset.ts",
    ],
  },
  createai: {
    presets: [
      "../../../ml-trainer/src/deployment/default/panda-preset.ts",
      "../../../ml-trainer-microbit/src/panda-preset.ts",
    ],
    // GT Walsheim for the `display` font token, reached via Heading's
    // `marketing` variant (the app's connection-flow animations use it).
    fontCss: "../../../ml-trainer-microbit/src/fonts/fonts.css",
  },
  classroom: {
    presets: [
      "../../packages/ui/src/dense-preset.ts",
      "../../../classroom/src/theme/panda-preset.ts",
    ],
    // Plain CSS despite the .scss extension (main.ts reads it as text).
    fontCss: "../../../classroom/src/styles/fonts/fonts.scss",
  },
  data: {
    presets: ["../../../data-microbit-org/src/theme/panda-preset.ts"],
    fontCss: "../../../data-microbit-org/src/styles/fonts/fonts.css",
  },
};

// Executed directly (rather than imported): print the named stack's presets.
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const name = process.argv[2] ?? "";
  const stack = STACKS[name];
  if (!stack) {
    throw new Error(
      `Unknown preset stack "${name}"; expected one of: ${Object.keys(STACKS).join(", ")}`,
    );
  }
  const presets: unknown[] = [];
  for (const spec of stack.presets) {
    let mod: unknown = await import(
      pathToFileURL(path.resolve(process.cwd(), spec)).href
    );
    while (mod && typeof mod === "object" && "default" in mod) {
      mod = (mod as { default: unknown }).default;
    }
    if (!mod || typeof mod !== "object" || !("theme" in mod)) {
      throw new Error(`${spec} did not resolve to a Panda preset`);
    }
    presets.push(mod);
  }
  process.stdout.write(JSON.stringify(presets));
}
