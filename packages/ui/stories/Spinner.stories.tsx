/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { HStack, Spinner } from "../src";

const meta = {
  title: "Feedback/Spinner",
  component: Spinner,
  args: { "aria-label": "Loading" },
} satisfies Meta<typeof Spinner>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <HStack gap={6} alignItems="center">
      <Spinner aria-label="Loading" size="sm" />
      <Spinner aria-label="Loading" size="md" />
    </HStack>
  ),
};
