/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { css } from "@microbit/ui";
import { ReactElement, useCallback, useMemo } from "react";
import { SwiperClass } from "swiper/react";
import SwiperCarousel from "./SwiperCarousel";

const cardWidth = 260;
const mobileSpaceBetween = 15;

/**
 * The carousel's accessible name: a pre-translated label, or the id of the
 * element naming it (CarouselRow's heading).
 */
export type CarouselName =
  | { containerLabel: string; ariaLabelledBy?: undefined }
  | { containerLabel?: undefined; ariaLabelledBy: string };

export type CarouselProps = {
  carouselItems: ReactElement[];
  /** Center the slides when there are too few to fill the row. */
  centerItems?: boolean;
  /** Show the prev/next overlay buttons (md+ only). */
  navigation?: boolean;
} & CarouselName;

/**
 * The standard micro:bit carousel: a paged row of 260px cards, slides per
 * page following the window width. For a differently-shaped carousel, use
 * SwiperCarousel directly.
 */
const Carousel = ({
  carouselItems,
  containerLabel,
  ariaLabelledBy,
  centerItems = false,
  navigation = true,
}: CarouselProps) => {
  const getSlidesPerGroup = useCallback((spacing: number) => {
    // --carousel-px is 20px at md+ where this calculation is used.
    return Math.max(
      1,
      Math.floor((window.innerWidth - 40) / (cardWidth + spacing)),
    );
  }, []);

  const breakpoints = useMemo(() => {
    if (typeof window === "undefined") {
      return;
    }

    return {
      // When window width is >= 0px.
      0: {
        spaceBetween: mobileSpaceBetween,
        slidesPerGroup: 1,
      },
      // When window width is >= 768px.
      768: {
        spaceBetween: 20,
        slidesPerGroup: getSlidesPerGroup(20),
      },
      // When window width is >= 992px.
      992: {
        spaceBetween: 25,
        slidesPerGroup: getSlidesPerGroup(25),
      },
      // When window width is >= 1200px.
      1200: {
        spaceBetween: 30,
        slidesPerGroup: getSlidesPerGroup(30),
      },
      // When window width is >= 1400px.
      1400: {
        spaceBetween: 30,
        slidesPerGroup: getSlidesPerGroup(30),
      },
    };
  }, [getSlidesPerGroup]);

  const getBreakpoint = useCallback(() => {
    if (typeof window !== "undefined" && breakpoints) {
      if (window.innerWidth < 768) {
        return breakpoints[0];
      } else if (window.innerWidth < 992) {
        return breakpoints[768];
      } else if (window.innerWidth < 1200) {
        return breakpoints[992];
      } else if (window.innerWidth < 1400) {
        return breakpoints[1200];
      } else {
        return breakpoints[1400];
      }
    }
  }, [breakpoints]);

  const recalculateBreakpoints = useCallback(
    (swiper: SwiperClass) => {
      if (typeof window === "undefined") {
        return;
      }
      const breakpoint = getBreakpoint();
      if (breakpoint) {
        let slidesPerGroup = breakpoint.slidesPerGroup;
        if (breakpoint.spaceBetween !== mobileSpaceBetween) {
          slidesPerGroup = getSlidesPerGroup(breakpoint.spaceBetween);
        }
        if (slidesPerGroup !== swiper.params.slidesPerGroup) {
          swiper.params.slidesPerGroup = slidesPerGroup;
          // Swiper's own resize handler runs first (registered with
          // priority), so the snap grid was already built with the previous
          // value.
          swiper.updateSlides();
        }
      }
    },
    [getBreakpoint, getSlidesPerGroup],
  );

  return (
    <SwiperCarousel
      breakpoints={breakpoints}
      slidesPerView="auto"
      carouselItems={carouselItems}
      centerInsufficientSlides={centerItems}
      containerLabel={containerLabel}
      aria-labelledby={ariaLabelledBy}
      navigation={navigation}
      onResize={recalculateBreakpoints}
      onInit={recalculateBreakpoints}
      speed={1000}
      slideClassName={css({
        width: `${cardWidth}px`,
        "& > div": { height: "100%" },
      })}
      className={css({
        "--carousel-px": { base: "12px", md: "20px" },
        "--carousel-pt": "1rem",
        "--carousel-pb": "12px",
        "& .swiper": {
          padding: "var(--carousel-pt) var(--carousel-px) var(--carousel-pb)",
        },
      })}
    />
  );
};

export default Carousel;
