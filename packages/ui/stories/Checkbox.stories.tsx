/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox, Stack } from "../src";

const meta = {
  title: "Forms/Checkbox",
  component: Checkbox,
  args: { children: "Remember this device" },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    isDisabled: { control: "boolean" },
  },
} satisfies Meta<typeof Checkbox>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <Stack gap={4}>
      <Checkbox>Unselected</Checkbox>
      <Checkbox defaultSelected>Remember this device</Checkbox>
      <Checkbox isDisabled>Disabled</Checkbox>
      <Checkbox defaultSelected isDisabled>
        Disabled, selected
      </Checkbox>
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap={4}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <Checkbox key={size} size={size} defaultSelected>
          Checkbox {size}
        </Checkbox>
      ))}
    </Stack>
  ),
};
