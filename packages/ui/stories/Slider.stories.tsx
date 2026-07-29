/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Box, Slider, Stack, Text } from "../src";

const meta = {
  title: "Forms/Slider",
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => {
    const [value, setValue] = useState(40);
    return (
      <Stack maxW="md">
        <Slider
          aria-label="Certainty"
          value={value}
          onChange={setValue}
          formatOptions={{ style: "unit", unit: "percent" }}
        />
      </Stack>
    );
  },
};

export const FocusMark: Story = {
  render: () => {
    const [value, setValue] = useState(60);
    return (
      <Stack gap={6} maxW="md">
        <Slider
          aria-label="Volume"
          value={value}
          onChange={setValue}
          mark={value}
        />
        <Text fontSize="sm" color="gray.600">
          The mark tracks the value and shows while the slider has focus.
        </Text>
      </Stack>
    );
  },
};

/**
 * Chakra's Tooltip-around-SliderThumb pattern: the bubble is driven from
 * hover on an enclosing element plus thumb focus.
 */
export const ThumbTooltip: Story = {
  render: () => {
    const [value, setValue] = useState(30);
    const [isFocused, setFocused] = useState(false);
    const [isHovered, setHovered] = useState(false);
    return (
      <Box
        maxW="md"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Slider
          aria-label="Speed"
          value={value}
          onChange={setValue}
          formatOptions={{ style: "unit", unit: "percent" }}
          thumbTooltip={`${value}%`}
          isThumbTooltipOpen={isHovered || isFocused}
          onThumbFocusChange={setFocused}
        />
      </Box>
    );
  },
};

/** Positioned overlays render as children of the (position: relative) root. */
export const OverlayChildren: Story = {
  render: () => {
    const [value, setValue] = useState(75);
    return (
      <Stack maxW="md" css={{ pb: "6" }}>
        <Slider aria-label="Threshold" value={value} onChange={setValue}>
          <Box
            css={{
              position: "absolute",
              top: "6",
              left: 0,
              fontSize: "sm",
              color: "gray.600",
            }}
          >
            0
          </Box>
          <Box
            css={{
              position: "absolute",
              top: "6",
              right: 0,
              fontSize: "sm",
              color: "gray.600",
            }}
          >
            100
          </Box>
        </Slider>
      </Stack>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <Stack maxW="md">
      <Slider
        aria-label="Certainty"
        value={40}
        onChange={() => undefined}
        isDisabled
      />
    </Stack>
  ),
};
