/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, Heading, HStack } from "@microbit/ui";
import { ReactNode } from "react";
import Carousel, { CarouselProps } from "./Carousel";

export interface CarouselRowProps extends CarouselProps {
  /** Row heading content, already translated; rendered as an <h2>. */
  title?: ReactNode;
  /**
   * Replaces the standard heading, rendered verbatim, for rows whose title
   * carries adornments (bring your own Heading). Wins over `title`.
   */
  titleElement?: ReactNode;
  /** Trailing controls beside the heading (e.g. import/view-all buttons). */
  actions?: ReactNode;
  /** Extra classes for the row (e.g. a `css(...)` result from the caller). */
  className?: string;
}

/**
 * Page furniture around a Carousel: a full-width row with a heading and
 * optional trailing actions. Carousel props pass through.
 */
const CarouselRow = ({
  title,
  titleElement,
  actions,
  className,
  ...carouselProps
}: CarouselRowProps) => {
  return (
    <Box w="100%" py={8} className={className}>
      <HStack
        px={{ base: "12px", md: "20px" }}
        mt={2}
        mb={2}
        gap={{ base: 3, sm: 12 }}
        justifyContent={{ base: "space-between", sm: "flex-start" }}
      >
        {titleElement ??
          (title !== undefined && <Heading size="lg">{title}</Heading>)}
        <HStack gap={3}>{actions}</HStack>
      </HStack>
      <Carousel {...carouselProps} />
    </Box>
  );
};

export default CarouselRow;
