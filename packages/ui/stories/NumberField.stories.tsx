/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { NumberField, Stack } from "../src";

const meta = {
  title: "Forms/NumberField",
  component: NumberField,
  args: {
    label: "Quantity",
    defaultValue: 3,
    minValue: 0,
    maxValue: 10,
  },
  argTypes: {
    step: { control: "number" },
    isDisabled: { control: "boolean" },
  },
} satisfies Meta<typeof NumberField>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  // groupCss must be a JSX literal for Panda extraction (playbook gotcha #9),
  // so it can't live in `args`.
  render: (args) => <NumberField {...args} groupCss={{ width: "32" }} />,
};

/** Values format (and parse) via Intl; steppers clamp to min/max. */
export const FormattedValues: Story = {
  render: () => (
    <Stack gap={6} maxW="md">
      <NumberField
        label="Height"
        defaultValue={25}
        minValue={0}
        formatOptions={{ style: "unit", unit: "centimeter" }}
        groupCss={{ width: "40" }}
      />
      <NumberField
        label="Sample rate"
        defaultValue={0.5}
        minValue={0}
        maxValue={1}
        step={0.05}
        formatOptions={{ style: "percent" }}
        groupCss={{ width: "40" }}
      />
    </Stack>
  ),
};
