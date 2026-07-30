/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack, Switch } from "../src";

const meta = {
  title: "Forms/Switch",
  component: Switch,
  args: { children: "Play sounds" },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    isDisabled: { control: "boolean" },
  },
} satisfies Meta<typeof Switch>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <Stack gap={4}>
      <Switch>Off</Switch>
      <Switch defaultSelected>Play sounds</Switch>
      <Switch isDisabled>Disabled</Switch>
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap={4}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <Switch key={size} size={size} defaultSelected>
          Switch {size}
        </Switch>
      ))}
    </Stack>
  ),
};
