/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Heading, VStack } from "../src";

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

const meta = {
  title: "Typography/Heading",
  component: Heading,
  args: { children: "The quick brown fox", size: "xl" },
  argTypes: {
    size: { control: "select", options: headingSizes },
    variant: { control: "select", options: ["marketing", "label", "subtitle"] },
  },
} satisfies Meta<typeof Heading>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

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
  // The variant is the point of this story; don't offer it as a control.
  argTypes: { variant: { table: { disable: true } } },
};

/**
 * The page-title pair, in the `headingAccent` colour. Both carry their own font
 * size and hold it against whatever `size` is in play, at every width — a
 * call-site `fontSize` style prop still wins if you need a different one.
 */
export const PageTitle: Story = {
  render: () => (
    <VStack alignItems="stretch" gap={3}>
      <Heading variant="label">Label heading (headingAccent)</Heading>
      <Heading as="h2" variant="subtitle">
        Subtitle heading (headingAccent)
      </Heading>
      {/* The size prop no longer fights the variant, so this stays 4xl. */}
      <Heading size="4xl" variant="label">
        Label heading, size=&quot;4xl&quot;
      </Heading>
    </VStack>
  ),
};
