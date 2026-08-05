/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { RiCheckLine } from "react-icons/ri";
import { Checkbox, CheckboxGroup, HStack, Icon, Stack, Text } from "../src";

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

/**
 * CheckboxGroup holds one value array for the set — each Checkbox's `value` is
 * its entry — and takes the field chrome the other fields take (label, helper
 * text, errors: see Forms/Field chrome). It brings no layout of its own, so
 * compose a Stack inside as RadioGroup does.
 */
export const Group: Story = {
  render: () => {
    const [value, setValue] = useState(["temperature"]);
    return (
      <Stack gap={4} maxW="sm">
        <CheckboxGroup
          label="Sensors to log"
          value={value}
          onChange={setValue}
          helperText="Each one adds a column to the CSV"
        >
          <Stack gap={3}>
            <Checkbox value="temperature">Temperature</Checkbox>
            <Checkbox value="light">Light level</Checkbox>
            <Checkbox value="sound">Sound level</Checkbox>
          </Stack>
        </CheckboxGroup>
        <Text fontSize="sm" color="gray.600">
          Selected: {value.length > 0 ? value.join(", ") : "none"}
        </Text>
      </Stack>
    );
  },
};

/**
 * `control={false}` drops the box (and its label wrapper): the children draw
 * the selected state themselves — a selectable tile here. The box carried the
 * focus ring, so the root has to restate one; render-prop children receive
 * the state to draw with. ListBox's "custom selected state" story shows the
 * same idea on an avatar.
 */
export const WithoutTheBox: Story = {
  render: () => (
    <HStack gap={3}>
      {["Blocks", "Python"].map((name) => (
        <Checkbox
          key={name}
          control={false}
          defaultSelected={name === "Blocks"}
          css={{
            px: 6,
            py: 4,
            borderRadius: "md",
            borderWidth: "2px",
            borderColor: "gray.200",
            "&[data-selected]": { borderColor: "brand.500", bg: "brand.50" },
            "&[data-focus-visible]": { focusShadow: "outline" },
          }}
        >
          {({ isSelected }) => (
            <HStack gap={2}>
              <Text fontWeight="semibold">{name}</Text>
              {isSelected && <Icon as={RiCheckLine} aria-hidden />}
            </HStack>
          )}
        </Checkbox>
      ))}
    </HStack>
  ),
};
