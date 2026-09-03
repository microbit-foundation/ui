/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { css, cx, LinkBox, LinkOverlay, LinkOverlayButton } from "@microbit/ui";
import { ReactElement } from "react";

/**
 * Card factories for the carousel stories. Not a stories file: Storybook
 * indexes every named export of *.stories.* as a story.
 */

const cardStyle = css({
  display: "flex",
  flexDirection: "column",
  bg: "white",
  borderRadius: "lg",
  boxShadow: "md",
  // Clips the edge-to-edge image block to the rounded top corners.
  overflow: "hidden",
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
export const exampleCards = (count: number): ReactElement[] =>
  Array.from({ length: count }, (_, i) => (
    <LinkBox key={i} className={cardStyle}>
      {/* Stands in for the apps' edge-to-edge card image. */}
      <div
        className={cx(
          css({ height: "120px" }),
          cardImageTints[i % cardImageTints.length],
        )}
      />
      <div
        className={css({
          display: "flex",
          flexDirection: "column",
          gap: 2,
          p: 4,
        })}
      >
        <p className={css({ fontWeight: "semibold" })}>
          <LinkOverlayButton css={{ _focusVisible: { focusRing: "outline" } }}>
            Card {i + 1}
          </LinkOverlayButton>
        </p>
        <p className={css({ color: "gray.600", fontSize: "sm" })}>
          {descriptions[i % descriptions.length]}
        </p>
      </div>
    </LinkBox>
  ));

const tintFills = ["#bee3f8", "#b2f5ea", "#e9d8fd", "#feebcb"];

const tintImageSrc = (i: number): string =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='4' height='3'><rect width='4' height='3' fill='${
      tintFills[i % tintFills.length]
    }'/></svg>`,
  );

/**
 * Cards whose overlay is a link over an image, like the apps' resource
 * cards. Links and images are natively draggable, so these exercise the
 * carousel's drag suppression.
 */
export const linkCards = (count: number): ReactElement[] =>
  Array.from({ length: count }, (_, i) => (
    <LinkBox key={i} className={cardStyle}>
      <img
        alt=""
        src={tintImageSrc(i)}
        className={css({ height: "120px", width: "100%", objectFit: "cover" })}
      />
      <div
        className={css({
          display: "flex",
          flexDirection: "column",
          gap: 2,
          p: 4,
        })}
      >
        <p className={css({ fontWeight: "semibold" })}>
          <LinkOverlay
            href="https://microbit.org/"
            target="_blank"
            rel="noreferrer"
            className={css({ _focusVisible: { focusRing: "outline" } })}
          >
            Link card {i + 1}
          </LinkOverlay>
        </p>
        <p className={css({ color: "gray.600", fontSize: "sm" })}>
          {descriptions[i % descriptions.length]}
        </p>
      </div>
    </LinkBox>
  ));
