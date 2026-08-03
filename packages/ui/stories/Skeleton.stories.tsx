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
  argTypes: {
    isLoaded: { control: "boolean" },
    speed: { control: { type: "number", step: 0.1 } },
  },
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

/**
 * Retinted through the custom-property pair the keyframe animates over —
 * a call site changes the colours without knowing how the animation works.
 */
export const Retinted: Story = {
  render: () => (
    <Skeleton
      css={{
        width: "20rem",
        height: "2rem",
        "--skeleton-start-color": "token(colors.brand.100)",
        "--skeleton-end-color": "token(colors.brand.300)",
      }}
    />
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
