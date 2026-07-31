/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Code, Text } from "../src";

const meta = {
  title: "Typography/Code",
  component: Code,
  args: { children: "npm install @microbit/ui" },
} satisfies Meta<typeof Code>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const InlineInText: Story = {
  render: () => (
    <Text maxW="lg">
      Install with <Code>npm install @microbit/ui</Code> and import from{" "}
      <Code>@microbit/ui</Code>.
    </Text>
  ),
};
