/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { css, cx } from "@microbit/ui";
import ChevronLeftIcon from "./ChevronLeftIcon";
import ChevronRightIcon from "./ChevronRightIcon";

interface CarouselButtonProps {
  "aria-label": string;
  direction: "left" | "right";
  /** Which edge of the carousel the button is pinned to. */
  side: "left" | "right";
  onClick?: () => void;
}

/**
 * Edge-pinned prev/next button overlaying the carousel. Spans from the
 * carousel's top padding to just above its bottom padding (drawing over the
 * card box shadows, hence the -8px). Out of the tab order by design: the
 * cards are the keyboard path.
 */
const CarouselButton = ({
  direction,
  side,
  onClick,
  ...rest
}: CarouselButtonProps) => {
  return (
    <button
      type="button"
      tabIndex={-1}
      className={cx(
        css({
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 0,
          border: "none",
          borderRadius: 0,
          bg: "rgba(245, 245, 245, 0.5)",
          // The icons follow currentColor.
          color: "gray.800",
          cursor: "pointer",
          transition: "background-color 0.2s ease",
          w: "60px",
          position: "absolute",
          zIndex: 5,
          top: "var(--carousel-pt)",
          bottom: "calc(var(--carousel-pb) - 8px)",
          outline: "none",
          _hover: {
            bg: "rgb(245, 245, 245)",
            "& svg": { transform: "scale(1.2)" },
          },
          _focusVisible: {
            focusRing: "outline",
          },
          "& svg": {
            objectFit: "contain",
            transition: "transform 0.2s ease",
            w: "30px",
            h: "30px",
          },
        }),
        side === "left"
          ? css({ left: 0, "& svg": { mr: "3px" } })
          : css({ right: 0, "& svg": { ml: "3px" } }),
      )}
      onClick={onClick}
      {...rest}
    >
      {direction === "left" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
    </button>
  );
};

export default CarouselButton;
