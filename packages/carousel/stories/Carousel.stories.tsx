/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { css, cx } from "@microbit/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Carousel } from "../src";

const cardStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: 2,
  p: 4,
  bg: "white",
  borderRadius: "lg",
  boxShadow: "md",
});

const cardImageTints = [
  css({ bg: "blue.100" }),
  css({ bg: "teal.100" }),
  css({ bg: "purple.100" }),
  css({ bg: "orange.100" }),
];

const descriptions = [
  "A short description.",
  "A longer description that wraps onto several lines to show the cards in a row stretching to equal heights.",
  "Something in between the two, about a line and a half long.",
];

export const exampleCards = (count: number): JSX.Element[] =>
  Array.from({ length: count }, (_, i) => (
    <div key={i} className={cardStyle}>
      <div
        className={cx(
          css({ height: "120px", borderRadius: "md" }),
          cardImageTints[i % cardImageTints.length],
        )}
      />
      <p className={css({ fontWeight: "semibold" })}>Card {i + 1}</p>
      <p className={css({ color: "gray.600", fontSize: "sm" })}>
        {descriptions[i % descriptions.length]}
      </p>
    </div>
  ));

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

/** Buttons off, e.g. for touch-only native platforms. */
export const NoNavigation: Story = {
  args: {
    carouselItems: exampleCards(12),
    containerLabel: "Example cards",
    navigation: false,
  },
};
