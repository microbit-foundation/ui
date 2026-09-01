/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { css } from "@microbit/ui";
import { useCallback, useMemo } from "react";
import { SwiperClass } from "swiper/react";
import SwiperCarousel from "./SwiperCarousel";

const slow = 3000;
const fast = 1000;
const cardWidth = 260;
const mobileSpaceBetween = 15;

export interface CarouselProps {
  carouselItems: JSX.Element[];
  /**
   * Accessible name for the carousel, already translated — typically the
   * carousel's on-screen title.
   */
  containerLabel: string;
  /**
   * Full-width hero mode: one slide per view, looping, autoplaying (paused
   * on hover, stopped on interaction), no nav buttons.
   */
  hero?: boolean;
  /** Center the slides when there are too few to fill the row. */
  centerItems?: boolean;
  /** Show the prev/next overlay buttons (md+ only). Not shown in hero mode. */
  navigation?: boolean;
}

/**
 * The standard micro:bit carousel: a paged row of 260px cards, or a
 * full-width autoplaying banner in hero mode. Slides per page follow the
 * window width. For a differently-shaped carousel, use SwiperCarousel
 * directly.
 */
const Carousel = ({
  carouselItems,
  containerLabel,
  hero = false,
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
      if (hero || typeof window === "undefined") {
        return;
      }
      const breakpoint = getBreakpoint();
      if (breakpoint) {
        let slidesPerGroup = breakpoint.slidesPerGroup;
        if (breakpoint.spaceBetween !== mobileSpaceBetween) {
          slidesPerGroup = getSlidesPerGroup(breakpoint.spaceBetween);
        }
        swiper.params.slidesPerGroup = slidesPerGroup;
      }
    },
    [getBreakpoint, getSlidesPerGroup, hero],
  );

  return (
    <SwiperCarousel
      autoHeight={hero}
      autoplay={
        hero
          ? {
              disableOnInteraction: true,
              delay: 10_000,
              pauseOnMouseEnter: true,
            }
          : false
      }
      breakpoints={
        hero
          ? {
              0: {
                slidesPerView: 1,
                spaceBetween: 0,
              },
            }
          : breakpoints
      }
      slidesPerView="auto"
      carouselItems={carouselItems}
      centerInsufficientSlides={centerItems}
      containerLabel={containerLabel}
      loop={hero}
      navigation={!hero && navigation}
      onResize={recalculateBreakpoints}
      onInit={recalculateBreakpoints}
      padding={hero ? 0 : undefined}
      speed={hero ? slow : fast}
      className={css({
        "--carousel-px": { base: "12px", md: "20px" },
        "--carousel-pt": "1rem",
        "--carousel-pb": "12px",
        "& li > div": { height: "100%", width: "260px" },
        "& .swiper": {
          padding: "var(--carousel-pt) var(--carousel-px) var(--carousel-pb)",
        },
      })}
    />
  );
};

export default Carousel;
