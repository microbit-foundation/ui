/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, NativeSelect } from "../src";

const meta = {
  title: "Forms/NativeSelect",
  component: NativeSelect,
  argTypes: {
    hideChevron: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof NativeSelect>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <Box maxW="md">
      <NativeSelect aria-label="Language" {...args}>
        <option>English</option>
        <option>Français</option>
        <option>日本語</option>
      </NativeSelect>
    </Box>
  ),
};
