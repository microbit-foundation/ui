/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ExternalLink, Link, Text } from "../src";

const meta = {
  title: "Typography/Link",
  component: Link,
  args: { children: "A link", href: "#" },
  argTypes: {
    variant: { control: "select", options: ["standalone"] },
  },
} satisfies Meta<typeof Link>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const InlineInText: Story = {
  render: () => (
    <Text maxW="lg">
      Body text with an inline <Link href="#">link</Link>, matching the
      surrounding text size.
    </Text>
  ),
};

export const External: Story = {
  render: () => (
    <Text maxW="lg">
      Prose with an{" "}
      <ExternalLink href="https://microbit.org">external link</ExternalLink>{" "}
      that opens a new tab: the glyph shows it and a visually hidden suffix
      announces it.
    </Text>
  ),
};

export const Standalone: Story = {
  render: () => (
    <Link href="#" variant="standalone">
      A standalone link (nav, menu, card) — underline on hover only
    </Link>
  ),
};
