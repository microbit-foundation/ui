/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { StorybookConfig } from "@storybook/react-vite";
import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";
import { STACKS } from "../load-extra-presets.ts";

/**
 * Serves `virtual:brand-fonts.css` (imported by preview.tsx): when
 * UI_PRESET_STACK names a stack with licensed brand fonts, the app's
 * @font-face rules reduced to their woff2 sources, inlined as data: URIs —
 * inlined because the font files live in sibling repos outside Vite's serving
 * root, and ~200KB per stack is fine for a local tool. Empty otherwise, so
 * the import is always resolvable (including in CI builds).
 */
const brandFontsPlugin = (): Plugin => ({
  name: "brand-fonts",
  resolveId: (id) => (id === "virtual:brand-fonts.css" ? id : undefined),
  load(id) {
    if (id !== "virtual:brand-fonts.css") return undefined;
    const fontCss = process.env.UI_PRESET_STACK
      ? STACKS[process.env.UI_PRESET_STACK]?.fontCss
      : undefined;
    if (!fontCss) return "";
    const cssPath = path.resolve(import.meta.dirname, "..", fontCss);
    const css = fs.readFileSync(cssPath, "utf8");
    return (css.match(/@font-face\s*\{[^}]*\}/g) ?? [])
      .map((block) => {
        const woff2 = block.match(/url\((['"]?)([^'")]*\.woff2)\1\)/);
        if (!woff2) return "";
        const data = fs
          .readFileSync(path.resolve(path.dirname(cssPath), woff2[2]))
          .toString("base64");
        return block
          .replace(/src:[^;]*;/g, "")
          .replace(
            "{",
            `{\n  src: url(data:font/woff2;base64,${data}) format("woff2");`,
          );
      })
      .join("\n");
  },
});

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../stories/**/*.stories.@(ts|tsx)"],
  features: {
    // No onboarding checklist in the sidebar or menu.
    sidebarOnboardingChecklist: false,
    menuOnboardingChecklist: false,
  },
  core: {
    disableWhatsNewNotifications: true,
  },
  viteFinal: (viteConfig) => {
    viteConfig.resolve ??= {};
    viteConfig.resolve.alias = {
      ...viteConfig.resolve.alias,
      // Panda CSS generated output (run `npm run panda`), imported by the
      // components as styled-system/*.
      "styled-system": path.resolve(import.meta.dirname, "../styled-system"),
    };
    viteConfig.plugins ??= [];
    viteConfig.plugins.push(brandFontsPlugin());
    return viteConfig;
  },
};

export default config;
