/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Link, Text } from "../src";

const meta = {
  title: "Typography/Link",
  component: Link,
  args: { children: "A link", href: "#" },
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
