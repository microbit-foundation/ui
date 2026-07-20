/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Preview } from "@storybook/react-vite";
import { IntlProvider } from "react-intl";
import { ToastProvider } from "../src";
import { messages } from "../src/messages";
import "./layers.css";
import "../styled-system.css";

/**
 * Wraps every story in the providers the README lists for consumers: an
 * IntlProvider (English catalog) for the components' internal strings, and a
 * single ToastProvider region so toast stories work.
 */
const preview: Preview = {
  decorators: [
    (Story) => (
      <IntlProvider locale="en" messages={messages.en}>
        <Story />
        <ToastProvider />
      </IntlProvider>
    ),
  ],
  parameters: {
    controls: { expanded: true },
  },
};

export default preview;
