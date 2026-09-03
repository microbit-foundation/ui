/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { css } from "@microbit/ui";
import { useEffect, useState } from "react";
import { useLocale } from "react-aria";
import { useIntl } from "react-intl";
import { useSwiper } from "swiper/react";
import CarouselButton from "./CarouselButton";
import { carouselMessage } from "./messages";

const edgeEvents = ["toEdge", "fromEdge", "lock", "unlock", "update"] as const;

/**
 * The prev/next buttons, hidden below md where swiping is the interaction.
 * Not tab stops — the cards are the keyboard path (each contains a tab
 * stop, and focusing one slides it into view) — but named and exposed to
 * assistive tech so voice-control users can activate them.
 *
 * Deliberately not wired to Swiper's navigation module: its a11y handling
 * re-adds tabindex="0" on edge changes, fighting the tab-order choice.
 */
const SwiperCarouselButtons = () => {
  const intl = useIntl();
  const isRtl = useLocale().direction === "rtl";
  const swiper = useSwiper();
  const [{ atStart, atEnd }, setEdges] = useState({
    atStart: true,
    atEnd: true,
  });
  useEffect(() => {
    const update = () => {
      setEdges({
        atStart: swiper.isBeginning || swiper.isLocked,
        atEnd: swiper.isEnd || swiper.isLocked,
      });
    };
    update();
    edgeEvents.forEach((event) => swiper.on(event, update));
    return () => {
      if (!swiper.destroyed) {
        edgeEvents.forEach((event) => swiper.off(event, update));
      }
    };
  }, [swiper]);

  return (
    <div className={css({ display: { base: "none", md: "contents" } })}>
      {!atStart && (
        <CarouselButton
          aria-label={intl.formatMessage(
            carouselMessage("ui-carousel.previous"),
          )}
          side={isRtl ? "right" : "left"}
          direction={isRtl ? "right" : "left"}
          onClick={() => swiper.slidePrev()}
        />
      )}
      {!atEnd && (
        <CarouselButton
          aria-label={intl.formatMessage(carouselMessage("ui-carousel.next"))}
          side={isRtl ? "left" : "right"}
          direction={isRtl ? "left" : "right"}
          onClick={() => swiper.slideNext()}
        />
      )}
    </div>
  );
};

export default SwiperCarouselButtons;
