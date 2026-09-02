/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { css, cx, LinkBox, LinkOverlayButton } from "@microbit/ui";
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

/**
 * Cards in the apps' shape: a LinkBox with a LinkOverlayButton as the one
 * tab stop, so the stories exercise keyboard navigation — tabbing to an
 * off-screen card slides the carousel to it (SwiperCarousel's slide-focus
 * handling).
 */
export const exampleCards = (count: number): JSX.Element[] =>
  Array.from({ length: count }, (_, i) => (
    <LinkBox key={i} className={cardStyle}>
      <div
        className={cx(
          css({ height: "120px", borderRadius: "md" }),
          cardImageTints[i % cardImageTints.length],
        )}
      />
      <p className={css({ fontWeight: "semibold" })}>
        <LinkOverlayButton css={{ _focusVisible: { focusRing: "outline" } }}>
          Card {i + 1}
        </LinkOverlayButton>
      </p>
      <p className={css({ color: "gray.600", fontSize: "sm" })}>
        {descriptions[i % descriptions.length]}
      </p>
    </LinkBox>
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
