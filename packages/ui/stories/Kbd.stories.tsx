/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Kbd, Text } from "../src";

const meta = {
  title: "Typography/Kbd",
  component: Kbd,
  args: { children: "Ctrl" },
} satisfies Meta<typeof Kbd>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Combination: Story = {
  render: () => (
    <Text>
      Press <Kbd>Ctrl</Kbd> + <Kbd>C</Kbd> to copy, or <Kbd>⌘</Kbd> +{" "}
      <Kbd>C</Kbd> on a Mac.
    </Text>
  ),
};
