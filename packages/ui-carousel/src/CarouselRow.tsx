/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, Heading, HStack } from "@microbit/ui";
import { ReactNode, useId } from "react";
import Carousel, { CarouselName, CarouselProps } from "./Carousel";

/**
 * The row's accessible name for its carousel: a heading (which also names
 * the carousel), or one of the headless Carousel namings.
 */
export type CarouselRowName =
  | {
      /**
       * Row heading content, already translated; rendered as an <h2> that
       * also names the carousel.
       */
      title: ReactNode;
      /**
       * Rendered beside the heading but outside the carousel's accessible
       * name (e.g. an info tooltip).
       */
      titleSuffix?: ReactNode;
      containerLabel?: undefined;
      ariaLabelledBy?: undefined;
    }
  | ({ title?: undefined; titleSuffix?: undefined } & CarouselName);

export type CarouselRowProps = Omit<
  CarouselProps,
  "containerLabel" | "ariaLabelledBy"
> &
  CarouselRowName & {
    /** Trailing controls beside the heading (e.g. import/view-all buttons). */
    actions?: ReactNode;
    /** Extra classes for the row (e.g. a `css(...)` result from the caller). */
    className?: string;
  };

/**
 * Page furniture around a Carousel: a full-width row with a heading and
 * optional trailing actions. Carousel props pass through.
 */
const CarouselRow = ({
  title,
  titleSuffix,
  actions,
  className,
  ...carouselProps
}: CarouselRowProps) => {
  const headingId = useId();
  return (
    <Box w="100%" py={8} className={className}>
      <HStack
        px={{ base: "12px", md: "20px" }}
        mt={2}
        mb={2}
        gap={{ base: 3, sm: 12 }}
        justifyContent={{ base: "space-between", sm: "flex-start" }}
      >
        {title !== undefined && (
          <HStack gap={3}>
            <Heading id={headingId} size="lg">
              {title}
            </Heading>
            {titleSuffix}
          </HStack>
        )}
        <HStack gap={3}>{actions}</HStack>
      </HStack>
      <Carousel
        // The union can't be proven through the conditional: a heading means
        // ariaLabelledBy, otherwise the row's own union guarantees a naming
        // in the rest props.
        {...({
          ariaLabelledBy: title !== undefined ? headingId : undefined,
          ...carouselProps,
        } as CarouselProps)}
      />
    </Box>
  );
};

export default CarouselRow;
