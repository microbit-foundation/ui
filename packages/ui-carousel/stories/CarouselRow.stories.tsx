/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button, Text } from "@microbit/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CarouselRow } from "../src";
import { exampleCards } from "./cards";

const meta = {
  title: "Carousel/CarouselRow",
  component: CarouselRow,
} satisfies Meta<typeof CarouselRow>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Standard: Story = {
  args: {
    title: "Project ideas",
    carouselItems: exampleCards(12),
  },
};

export const WithActions: Story = {
  args: {
    title: "My projects",
    carouselItems: exampleCards(8),
    actions: (
      <>
        <Button variant="secondary">Import</Button>
        <Button variant="secondary">View all</Button>
      </>
    ),
  },
};

/**
 * `titleSuffix` renders beside the heading but stays out of the carousel's
 * accessible name.
 */
export const WithTitleSuffix: Story = {
  args: {
    title: "My projects",
    titleSuffix: <Text color="gray.600">(stored in this browser)</Text>,
    carouselItems: exampleCards(8),
  },
};
