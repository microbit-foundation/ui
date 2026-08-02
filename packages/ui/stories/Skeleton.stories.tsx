/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton, SkeletonText, Stack, Text } from "../src";

const meta = {
  title: "Feedback/Skeleton",
  component: Skeleton,
  argTypes: { isLoaded: { control: "boolean" } },
} satisfies Meta<typeof Skeleton>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    children: <Text>Loaded content</Text>,
    css: { width: "20rem", height: "2rem" },
  },
};

export const Text_: Story = {
  name: "SkeletonText",
  render: () => (
    <Stack gap={8} css={{ width: "20rem" }}>
      <SkeletonText noOfLines={5} spacing="1.25rem" skeletonHeight="0.5rem" />
      <SkeletonText noOfLines={1} />
    </Stack>
  ),
};

/** A skeleton sized by the content it is standing in for. */
export const SizedByContent: Story = {
  render: () => (
    <Stack gap={4} css={{ width: "20rem" }}>
      <Skeleton>
        <Text>Something the width of this sentence.</Text>
      </Skeleton>
      <Skeleton isLoaded>
        <Text>Something the width of this sentence.</Text>
      </Skeleton>
    </Stack>
  ),
};
