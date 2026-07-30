/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, NativeSelect, Stack } from "../src";

const meta = {
  title: "Forms/NativeSelect",
  component: NativeSelect,
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
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

export const Sizes: Story = {
  render: (args) => (
    <Stack gap={4} maxW="md">
      {(["sm", "md", "lg"] as const).map((size) => (
        <NativeSelect key={size} aria-label={size} {...args} size={size}>
          <option>{size}</option>
          <option>Français</option>
        </NativeSelect>
      ))}
    </Stack>
  ),
};
