/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ReactNode } from "react";
import {
  Slider as RACSlider,
  SliderThumb,
  SliderTrack,
} from "react-aria-components";
import { css, cx } from "styled-system/css";
import { slider } from "styled-system/recipes";
import { SystemStyleObject } from "styled-system/types";

export interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  minValue?: number;
  maxValue?: number;
  "aria-label": string;
  isDisabled?: boolean;
  /**
   * Number format for the value announced to assistive tech (e.g.
   * `{ style: "unit", unit: "percent" }` so units are heard, not bare
   * numbers).
   */
  formatOptions?: Intl.NumberFormatOptions;
  /** Per-instance style overrides, merged after the recipe. */
  css?: SystemStyleObject;
  trackCss?: SystemStyleObject;
  filledTrackCss?: SystemStyleObject;
  thumbCss?: SystemStyleObject;
  /**
   * Positioned at the current value along the track and shown while the
   * slider has focus (Chakra's SliderMark usage).
   */
  mark?: ReactNode;
  markCss?: SystemStyleObject;
  /**
   * Additional positioned overlays rendered inside the slider root
   * (always-visible value labels, threshold markers, ...). The root is
   * position: relative; position children absolutely, typically with a
   * percentage `left` for the track position.
   */
  children?: ReactNode;
  /**
   * Tooltip-styled bubble anchored above the thumb (Chakra's
   * Tooltip-around-SliderThumb pattern). Rendered only while
   * `isThumbTooltipOpen`; drive it from hover/focus, e.g. via
   * `onThumbFocusChange` and mouse handlers on an enclosing element.
   */
  thumbTooltip?: ReactNode;
  isThumbTooltipOpen?: boolean;
  /** Thumb focus tracking (react-aria focus events). */
  onThumbFocusChange?: (isFocused: boolean) => void;
}

/**
 * Slider — react-aria-components <Slider> styled like Chakra's horizontal md
 * slider.
 */
export const Slider = ({
  value,
  onChange,
  minValue = 0,
  maxValue = 100,
  "aria-label": ariaLabel,
  isDisabled,
  formatOptions,
  css: cssProp,
  trackCss,
  filledTrackCss,
  thumbCss,
  mark,
  markCss,
  children,
  thumbTooltip,
  isThumbTooltipOpen,
  onThumbFocusChange,
}: SliderProps) => {
  const slots = slider();
  const percent = ((value - minValue) / (maxValue - minValue)) * 100;
  return (
    <RACSlider
      value={value}
      onChange={onChange}
      minValue={minValue}
      maxValue={maxValue}
      aria-label={ariaLabel}
      isDisabled={isDisabled}
      formatOptions={formatOptions}
      className={cx(slots.root, cssProp ? css(cssProp) : undefined)}
    >
      {mark && (
        <div
          data-part="mark"
          className={cx(slots.mark, markCss ? css(markCss) : undefined)}
          style={{ left: `${percent}%` }}
        >
          {mark}
        </div>
      )}
      <SliderTrack
        className={cx(slots.track, trackCss ? css(trackCss) : undefined)}
      >
        <div
          className={cx(
            slots.filledTrack,
            filledTrackCss ? css(filledTrackCss) : undefined,
          )}
          style={{ width: `${percent}%` }}
        />
      </SliderTrack>
      {thumbTooltip && isThumbTooltipOpen && (
        // Matches the shared Tooltip's look (tooltipBase) with a bottom
        // arrow, anchored above the thumb.
        <div
          role="presentation"
          className={css({
            position: "absolute",
            bottom: "calc(50% + token(sizes.3.5))",
            transform: "translateX(-50%)",
            bg: "gray.700",
            color: "white",
            px: "2",
            py: "1",
            borderRadius: "md",
            fontSize: "sm",
            fontWeight: "medium",
            boxShadow: "md",
            zIndex: "tooltip",
            whiteSpace: "nowrap",
            _after: {
              content: '""',
              position: "absolute",
              // 1px into the box so subpixel edges can't antialias into a
              // hairline seam (see PopoverArrow).
              top: "calc(100% - 1px)",
              left: "50%",
              transform: "translateX(-50%)",
              borderWidth: "4px",
              borderStyle: "solid",
              // Per-side: tokens don't resolve inside multi-value
              // shorthands (they emit verbatim and the browser drops the
              // invalid declaration).
              borderColor: "transparent",
              borderTopColor: "gray.700",
            },
          })}
          style={{ left: `${percent}%` }}
        >
          {thumbTooltip}
        </div>
      )}
      <SliderThumb
        onFocusChange={onThumbFocusChange}
        className={cx(slots.thumb, thumbCss ? css(thumbCss) : undefined)}
      />
      {children}
    </RACSlider>
  );
};
