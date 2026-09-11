/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { NotFoundPage } from "../src";

const meta = {
  title: "Patterns/NotFoundPage",
  component: NotFoundPage,
  args: { homeUrl: "#" },
} satisfies Meta<typeof NotFoundPage>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** For apps that name themselves in the link, as ml-trainer does. */
export const WithAppName: Story = {
  args: { homeLinkText: "micro:bit CreateAI home page" },
};
