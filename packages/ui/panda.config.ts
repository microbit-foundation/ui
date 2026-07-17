/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { defineConfig } from "@pandacss/dev";
import { sharedUiPreset } from "./src/panda-preset";

/**
 * Package-local Panda config for `panda codegen` only: it generates the
 * styled-system/ output the sources import so the package typechecks
 * standalone. Consumers run their own codegen over their full preset stack
 * (see README) — nothing generated here is shipped.
 */
export default defineConfig({
  preflight: true,
  jsxFramework: "react",
  eject: true,
  presets: ["@pandacss/preset-base", sharedUiPreset],
  include: ["./src/**/*.{ts,tsx}"],
  outdir: "styled-system",
});
