/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, ProgressBar, Stack } from "../src";

const meta = {
  title: "Feedback/ProgressBar",
  component: ProgressBar,
  args: { "aria-label": "Progress", value: 60 },
} satisfies Meta<typeof ProgressBar>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <Box maxW="md">
      <ProgressBar {...args} />
    </Box>
  ),
};

export const BarColour: Story = {
  render: () => (
    <Stack gap={6} maxW="md">
      <ProgressBar aria-label="Progress" value={60} />
      <ProgressBar
        aria-label="Download"
        value={80}
        barCss={{ bg: "green.500" }}
      />
    </Stack>
  ),
};
