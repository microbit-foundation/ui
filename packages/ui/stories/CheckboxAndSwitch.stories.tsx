/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox, Stack, Switch } from "../src";

const meta = {
  title: "Forms/Checkbox & Switch",
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Checkboxes: Story = {
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

export const Switches: Story = {
  render: () => (
    <Stack gap={4}>
      <Switch>Off</Switch>
      <Switch defaultSelected>Play sounds</Switch>
      <Switch isDisabled>Disabled</Switch>
    </Stack>
  ),
};
