/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Preview } from "@storybook/react-vite";
import { IntlProvider } from "react-intl";
import { SharedUIProvider, ToastProvider } from "@microbit/ui";
import { defaultLocale, localeOrDefault, locales } from "./locales";
// @pandacss/dev/postcss (postcss.config.cjs) generates Panda's CSS into this
// file's cascade-layer declaration at build time — no separate styled-system.css.
import "./layers.css";
// Brand @font-face rules when UI_PRESET_STACK is set; empty otherwise (main.ts).
import "virtual:brand-fonts.css";

/**
 * Wraps every story in the providers the README lists for consumers: an
 * IntlProvider for the components' internal strings, a SharedUIProvider so
 * react-aria's built-in strings follow that locale rather than the browser's,
 * and a single ToastProvider region so toast stories work.
 *
 * The toolbar's locale picker drives both. SharedUIProvider's `setDocumentLang`
 * puts `lang` and `dir` on the preview iframe's `<html>`, so picking Arabic
 * flips the canvas to RTL exactly as it would flip a real app.
 */
const preview: Preview = {
  globalTypes: {
    locale: {
      description: "Locale for the components' own strings",
      toolbar: {
        icon: "globe",
        items: locales.map(({ id, title }) => ({ value: id, title })),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    locale: defaultLocale,
  },
  decorators: [
    (Story, { globals }) => {
      const locale = localeOrDefault(globals.locale);
      return (
        <IntlProvider locale={locale.id} messages={locale.messages}>
          <SharedUIProvider>
            <Story />
            <ToastProvider />
          </SharedUIProvider>
        </IntlProvider>
      );
    },
  ],
  parameters: {
    // disableSaveFromUI hides the Controls-panel buttons that would write
    // tweaked args back into the .stories.tsx files.
    controls: { expanded: true, disableSaveFromUI: true },
    options: {
      storySort: {
        order: [
          "Layout",
          "Typography",
          "Buttons",
          "Forms",
          "Overlays",
          "Feedback",
          "Surfaces",
          "Media & icons",
          "Transitions",
          "Hooks",
          "Utilities",
        ],
      },
    },
  },
};

export default preview;
