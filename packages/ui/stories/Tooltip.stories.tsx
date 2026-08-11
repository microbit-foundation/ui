/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, HStack, Tooltip } from "../src";

const meta = {
  title: "Overlays/Tooltip",
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <Tooltip label="Tooltips use the dark style" hasArrow>
      <Button variant="ghost">Hover me</Button>
    </Tooltip>
  ),
};

export const Placements: Story = {
  render: () => (
    <HStack gap={4}>
      {(["top", "bottom", "left", "right"] as const).map((placement) => (
        <Tooltip
          key={placement}
          label={placement}
          placement={placement}
          hasArrow
        >
          <Button variant="secondary">{placement}</Button>
        </Tooltip>
      ))}
    </HStack>
  ),
};
