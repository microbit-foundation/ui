/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Carousel } from "../src";
import { exampleCards, linkCards } from "./cards";

const meta = {
  title: "Carousel/Carousel",
  component: Carousel,
} satisfies Meta<typeof Carousel>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Standard: Story = {
  args: {
    carouselItems: exampleCards(12),
    containerLabel: "Example cards",
  },
};

/**
 * `centerItems` centres a row with too few cards to fill the width instead
 * of leaving them left-aligned.
 */
export const CenterItems: Story = {
  args: {
    carouselItems: exampleCards(3),
    containerLabel: "Example cards",
    centerItems: true,
  },
};

/** Anchor-overlay cards with images — natively draggable content. */
export const LinkCards: Story = {
  args: {
    carouselItems: linkCards(12),
    containerLabel: "Example link cards",
  },
};

/** Buttons off, e.g. for touch-only native platforms. */
export const NoNavigation: Story = {
  args: {
    carouselItems: exampleCards(12),
    containerLabel: "Example cards",
    navigation: false,
  },
};
