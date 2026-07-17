/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Panda CSS generated output. The alias applies to all importers, so it
      // also resolves the styled-system/* imports inside @microbit/ui's
      // shipped source onto this app's generated output (Panda's ship-as-source
      // library pattern).
      "styled-system": path.resolve(import.meta.dirname, "styled-system"),
    },
  },
});
