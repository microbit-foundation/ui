/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Image } from "../src";

const meta = {
  title: "Media & icons/Image",
  component: Image,
} satisfies Meta<typeof Image>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <Image
      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='180'%3E%3Crect width='320' height='180' fill='%23343a40'/%3E%3Ccircle cx='120' cy='90' r='16' fill='%23fff'/%3E%3Ccircle cx='200' cy='90' r='16' fill='%23fff'/%3E%3C/svg%3E"
      alt="Placeholder graphic"
      borderRadius="lg"
      maxW="xs"
    />
  ),
};
