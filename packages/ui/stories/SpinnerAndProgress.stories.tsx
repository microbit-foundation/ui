/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, HStack, ProgressBar, Spinner, Stack } from "../src";

const meta = {
  title: "Feedback/Spinner & Progress",
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Spinners: Story = {
  render: () => (
    <HStack gap={6} alignItems="center">
      <Spinner aria-label="Loading" size="sm" />
      <Spinner aria-label="Loading" size="md" />
    </HStack>
  ),
};

export const Progress: Story = {
  render: () => (
    <Stack gap={6} maxW="md">
      <ProgressBar aria-label="Progress" value={60} />
      <Box>
        <ProgressBar
          aria-label="Download"
          value={80}
          barCss={{ bg: "green.500" }}
        />
      </Box>
    </Stack>
  ),
};
