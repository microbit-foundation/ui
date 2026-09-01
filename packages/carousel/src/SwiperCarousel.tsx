/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { css, cx } from "@microbit/ui";
import React, { useCallback, useState } from "react";
import { useLocale } from "react-aria";
import { useIntl } from "react-intl";
import { Swiper as SwiperClass } from "swiper";
import "./swiper.css";
import { A11y, Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperProps, SwiperSlide } from "swiper/react";
import SwiperCarouselButtons from "./SwiperCarouselButtons";

export interface SwiperCarouselProps extends SwiperProps {
  carouselItems: JSX.Element[];
  /**
   * Accessible name for the carousel, already translated — typically the
   * carousel's on-screen title.
   */
  containerLabel: string;
  padding?: string | number;
  slideClassName?: string;
  swiperWrapperClassName?: string;
  /** Extra classes for the root (e.g. a `css(...)` result from the caller). */
  className?: string;
}

const swiperModules = [A11y, Autoplay, Navigation, Pagination];

/**
 * Thin shared wrapper over Swiper: list semantics, translated ARIA
 * annotations, focus-follows-slide, and our edge-pinned prev/next buttons
 * (enable with `navigation`). Layout decisions — breakpoints, slide sizing,
 * padding — stay with the caller; see `Carousel` for the standard card row.
 */
const SwiperCarousel = ({
  carouselItems,
  containerLabel,
  padding,
  navigation,
  slideClassName,
  swiperWrapperClassName,
  className,
  ...props
}: SwiperCarouselProps) => {
  const intl = useIntl();
  const { direction } = useLocale();
  const [swiper, setSwiper] = useState<SwiperClass>();
  const handleSlideFocus = useCallback(
    (e: React.FocusEvent<HTMLElement, Element>) => {
      if (swiper) {
        swiper.slides.forEach((slide, i) => {
          if (slide.contains(e.target)) {
            swiper.activeIndex = i;
            swiper.updateSlidesClasses();
            swiper.slideTo(i);
          }
        });
      }
    },
    [swiper],
  );

  const handleSwiper = useCallback((swiper: SwiperClass) => {
    setSwiper(swiper);
    swiper.update();
  }, []);

  return (
    <div
      className={cx(
        css({
          display: "grid",
          overflow: "hidden",
          "--swiper-theme-color": "black",
          "--swiper-navigation-size": "50",
          "& ul": { margin: 0 },
          "& .swiper-slide": {
            transform: "translate3d(0, 0, 0) translateZ(0) !important",
            width: "unset",
          },
        }),
        className,
      )}
    >
      <Swiper
        onSwiper={handleSwiper}
        // Swiper preventDefaults pointerdown by default, which suppresses the
        // compatibility mousedown/mouseup events that overlays (e.g. menus)
        // rely on to detect an outside click and dismiss.
        touchStartPreventDefault={false}
        style={{
          ...(padding !== undefined && { padding }),
          alignItems: "stretch",
        }}
        dir={direction}
        a11y={{
          enabled: true,
          slideRole: "presentation",
          containerRoleDescriptionMessage: intl.formatMessage({
            id: "carousel-role",
            defaultMessage: "carousel",
          }),
          itemRoleDescriptionMessage: intl.formatMessage({
            id: "carousel-slide-role",
            defaultMessage: "slide",
          }),
          containerMessage: containerLabel,
          slideLabelMessage: intl.formatMessage(
            {
              id: "carousel-slide-label",
              defaultMessage: "{slideNum} of {totalSlides}",
            },
            {
              slideNum: "{{index}}",
              totalSlides: "{{slidesLength}}",
            },
          ),
        }}
        modules={swiperModules}
        tag="ul"
        watchSlidesProgress
        wrapperClass={swiperWrapperClassName}
        {...props}
      >
        {navigation && <SwiperCarouselButtons />}
        {carouselItems.map((item) => (
          <SwiperSlide
            key={item.key}
            className={slideClassName}
            onFocus={handleSlideFocus}
            tag="li"
          >
            {item}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default SwiperCarousel;
