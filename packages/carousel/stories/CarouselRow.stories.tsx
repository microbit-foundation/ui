/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button, Heading, HStack, Text } from "@microbit/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CarouselRow } from "../src";
import { exampleCards } from "./Carousel.stories";

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
    containerLabel: "Project ideas",
  },
};

export const WithActions: Story = {
  args: {
    title: "My projects",
    carouselItems: exampleCards(8),
    containerLabel: "My projects",
    actions: (
      <>
        <Button variant="secondary">Import</Button>
        <Button variant="secondary">View all</Button>
      </>
    ),
  },
};

/**
 * `titleElement` replaces the standard heading for titles with adornments —
 * bring your own Heading.
 */
export const WithTitleElement: Story = {
  args: {
    titleElement: (
      <HStack gap={3}>
        <Heading size="lg">My projects</Heading>
        <Text color="gray.600">(stored in this browser)</Text>
      </HStack>
    ),
    carouselItems: exampleCards(8),
    containerLabel: "My projects",
  },
};
