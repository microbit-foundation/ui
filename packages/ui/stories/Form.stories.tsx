/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  Box,
  Checkbox,
  NativeSelect,
  Slider,
  Stack,
  Switch,
  TextField,
} from "../src";

const meta = {
  title: "Components/Form controls",
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const TextFields: Story = {
  render: () => (
    <Stack gap={6} maxW="md">
      <TextField label="Name" helperText="As shown on the certificate" />
      <TextField
        label="Project name"
        isInvalid
        errorMessage="A project name is required"
      />
    </Stack>
  ),
};

export const Select: Story = {
  render: () => (
    <Box maxW="md">
      <NativeSelect aria-label="Language">
        <option>English</option>
        <option>Français</option>
        <option>日本語</option>
      </NativeSelect>
    </Box>
  ),
};

export const CheckboxAndSwitch: Story = {
  render: () => (
    <Stack gap={4}>
      <Checkbox defaultSelected>Remember this device</Checkbox>
      <Switch defaultSelected>Play sounds</Switch>
    </Stack>
  ),
};

export const SliderControl: Story = {
  render: () => {
    const [value, setValue] = useState(40);
    return (
      <Stack maxW="md">
        <Slider
          aria-label="Certainty"
          value={value}
          onChange={setValue}
          formatOptions={{ style: "unit", unit: "percent" }}
        />
      </Stack>
    );
  },
};
