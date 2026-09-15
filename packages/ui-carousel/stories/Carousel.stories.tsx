/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Carousel } from "../src";
import { exampleCards, linkCards, menuCards } from "./cards";

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

/**
 * Cards with a "…" actions menu, as the apps' project cards have. The menu
 * trigger focuses itself on press, driving focus-follows-slide: opening a
 * wholly visible card's menu (or tabbing to it) must not move the carousel.
 * Most visible at narrow widths, where the carousel can be at a position
 * that isn't the focused card's own snap point.
 */
export const MenuCards: Story = {
  args: {
    carouselItems: menuCards(12),
    containerLabel: "Example menu cards",
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
