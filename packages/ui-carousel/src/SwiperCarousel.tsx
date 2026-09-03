/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { css, cx } from "@microbit/ui";
import React, { useCallback, useEffect, useState } from "react";
import { useLocale } from "react-aria";
import { useIntl } from "react-intl";
import { Swiper as SwiperClass } from "swiper";
import "./swiper.css";
import { A11y, Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperProps, SwiperSlide } from "swiper/react";
import { carouselMessage } from "./messages";
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

const swiperModules = [A11y, Autoplay, Pagination];

/**
 * Thin shared wrapper over Swiper: APG carousel semantics, translated ARIA
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
        // Undo the browser's native scroll-focused-element-into-view:
        // Swiper positions by transform, so a real scrollLeft on the
        // overflow-hidden container desyncs the view.
        swiper.el.scrollLeft = 0;
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

  // Swiper reads the direction from the DOM only at init, so on a live
  // locale switch its translate maths run backwards against the flipped
  // layout (drag clamps early, buttons move the wrong way). The `dir` prop
  // below only covers first render; this is the official API for changes
  // after it, and a no-op when the direction already matches.
  useEffect(() => {
    if (swiper && !swiper.destroyed) {
      swiper.changeLanguageDirection(direction);
    }
  }, [swiper, direction]);

  return (
    <div
      className={cx(
        css({
          display: "grid",
          overflow: "hidden",
          "--swiper-theme-color": "black",
          "--swiper-navigation-size": "50",
          // Swiper's own margin-inline auto would disable the grid item's
          // stretch, sizing .swiper to its slides — it then measures itself
          // as fitting and locks (no drag, no buttons).
          "& .swiper": { margin: 0 },
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
        // Swiper refuses to drag from its default focusableElements list,
        // and our cards are covered by overlay buttons — a drag from a card
        // face poisons the gesture and snaps to slide 0 (swiper#5524).
        focusableElements="input, select, option, textarea, video"
        style={{
          ...(padding !== undefined && { padding }),
          alignItems: "stretch",
        }}
        dir={direction}
        a11y={{
          enabled: true,
          // The APG grouped-carousel pattern: a labelled region of
          // role="group" slides (Swiper's default), each labelled "8 of 12"
          // — announced when Tab moves focus into a slide's card, which is
          // the only way focus arrives (the slides themselves never focus).
          containerRole: "region",
          containerRoleDescriptionMessage: intl.formatMessage(
            carouselMessage("ui-carousel.role"),
          ),
          itemRoleDescriptionMessage: intl.formatMessage(
            carouselMessage("ui-carousel.slide-role"),
          ),
          containerMessage: containerLabel,
          // Swiper's own default label reads as "one slash twelve".
          slideLabelMessage: intl.formatMessage(
            carouselMessage("ui-carousel.slide-label"),
            {
              slideNum: "{{index}}",
              totalSlides: "{{slidesLength}}",
            },
          ),
        }}
        modules={swiperModules}
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
          >
            {item}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default SwiperCarousel;
