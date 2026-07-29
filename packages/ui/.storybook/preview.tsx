/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Preview } from "@storybook/react-vite";
import { IntlProvider } from "react-intl";
import { ToastProvider } from "../src";
// @pandacss/dev/postcss (postcss.config.cjs) generates Panda's CSS into this
// file's cascade-layer declaration at build time — no separate styled-system.css.
import "./layers.css";

/**
 * Wraps every story in the providers the README lists for consumers: an
 * IntlProvider for the components' internal strings (English needs no
 * catalog), and a single ToastProvider region so toast stories work.
 */
const preview: Preview = {
  decorators: [
    (Story) => (
      <IntlProvider locale="en">
        <Story />
        <ToastProvider />
      </IntlProvider>
    ),
  ],
  parameters: {
    controls: { expanded: true },
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
