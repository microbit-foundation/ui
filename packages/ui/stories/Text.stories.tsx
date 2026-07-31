/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Text, VStack } from "../src";

const textSizes = ["sm", "md", "lg"] as const;

const meta = {
  title: "Typography/Text",
  component: Text,
  args: {
    children:
      "Body text using the Chakra v2 design language on Panda CSS. Text takes Panda style props for one-off size and colour tweaks.",
  },
  argTypes: {
    size: { control: "select", options: textSizes },
  },
} satisfies Meta<typeof Text>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <VStack alignItems="stretch" gap={3}>
      {textSizes.map((size) => (
        <Text key={size} size={size}>
          Text {size}
        </Text>
      ))}
      <Text>Text without a size inherits from its container.</Text>
    </VStack>
  ),
};
