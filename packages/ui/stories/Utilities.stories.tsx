/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack, Text, VisuallyHidden } from "../src";

const meta = {
  title: "Utilities",
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const VisuallyHiddenStory: Story = {
  name: "VisuallyHidden",
  render: () => (
    <Stack gap={2} maxW="md">
      <Text>
        The end of this sentence is only exposed to assistive technology:
        <VisuallyHidden> hello, screen reader!</VisuallyHidden>
      </Text>
      <Text fontSize="sm" color="gray.600">
        Inspect the DOM or use a screen reader to find the hidden text.
      </Text>
    </Stack>
  ),
};
