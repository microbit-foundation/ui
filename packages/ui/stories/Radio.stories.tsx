/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Radio, RadioGroup, Stack } from "../src";

const meta = {
  title: "Forms/Radio",
  component: Radio,
  // The renders below supply real values; this just satisfies Radio's
  // required `value` for the args type.
  args: { value: "unused" },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    isDisabled: { control: "boolean" },
  },
} satisfies Meta<typeof Radio>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <RadioGroup aria-label="Device" defaultValue="microbit-v2">
      <Stack gap={3}>
        <Radio {...args} value="microbit-v1">
          micro:bit V1
        </Radio>
        <Radio {...args} value="microbit-v2">
          micro:bit V2
        </Radio>
        <Radio {...args} value="none" isDisabled>
          No device
        </Radio>
      </Stack>
    </RadioGroup>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap={6}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <RadioGroup key={size} aria-label={size} defaultValue="a">
          <Stack gap={3}>
            <Radio size={size} value="a">
              Radio {size}
            </Radio>
            <Radio size={size} value="b">
              Radio {size}
            </Radio>
          </Stack>
        </RadioGroup>
      ))}
    </Stack>
  ),
};
