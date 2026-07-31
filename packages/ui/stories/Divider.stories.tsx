/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Divider, HStack, Stack, Text } from "../src";

const meta = {
  title: "Typography/Divider",
  component: Divider,
} satisfies Meta<typeof Divider>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <Stack gap={4} maxW="md">
      <Text>Content above the divider.</Text>
      <Divider />
      <Text>Content below the divider.</Text>
    </Stack>
  ),
};

export const Vertical: Story = {
  render: () => (
    <HStack gap={4} alignItems="stretch" h="8">
      <Text>Left</Text>
      <Divider orientation="vertical" />
      <Text>Right</Text>
    </HStack>
  ),
};
