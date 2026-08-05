/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Mark, Text } from "../src";

const meta = {
  title: "Typography/Mark",
  component: Mark,
  args: { children: "highlighted" },
} satisfies Meta<typeof Mark>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const InProse: Story = {
  render: () => (
    <Text>
      Plug the micro:bit in, then press <Mark fontWeight="bold">button A</Mark>{" "}
      to start logging — the family&apos;s common use is a bold run inside a
      translated sentence.
    </Text>
  ),
};
