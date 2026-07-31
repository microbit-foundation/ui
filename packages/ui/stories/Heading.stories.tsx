/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Heading, VStack } from "../src";

const meta = {
  title: "Typography/Heading",
  component: Heading,
  args: { children: "The quick brown fox" },
} satisfies Meta<typeof Heading>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const headingSizes = [
  "4xl",
  "3xl",
  "2xl",
  "xl",
  "lg",
  "md",
  "sm",
  "xs",
] as const;

export const Sizes: Story = {
  render: () => (
    <VStack alignItems="stretch" gap={3}>
      {headingSizes.map((size) => (
        <Heading key={size} size={size}>
          Heading {size}
        </Heading>
      ))}
    </VStack>
  ),
};

export const Marketing: Story = {
  args: {
    size: "lg",
    variant: "marketing",
    children: "Marketing heading (display font)",
  },
};
