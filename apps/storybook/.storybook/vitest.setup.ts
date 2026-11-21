/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";
import { setProjectAnnotations } from "@storybook/react-vite";
import * as projectAnnotations from "./preview";

setProjectAnnotations([a11yAddonAnnotations, projectAnnotations]);

// Play functions that need real key presses look for this global to tell
// the browser runner from the Storybook UI, and return early without it
// (see Modal.stories.tsx). It is internal to vitest: fail here if an
// upgrade drops it, where those stories would pass without pressing a key.
if (!("__vitest_browser__" in globalThis)) {
  throw new Error(
    "vitest no longer sets __vitest_browser__: update this check and realKeyboard in Modal.stories.tsx",
  );
}
