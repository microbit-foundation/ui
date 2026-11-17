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
          // The component only sets the mark's `left`; call sites position
          // and style it.
          markCss={{
            top: "5",
            transform: "translateX(-50%)",
            bg: "gray.600",
            color: "white",
            borderRadius: "sm",
            fontSize: "xs",
            px: "1",
          }}
        />
        <Text fontSize="sm" color="gray.600">
          The mark tracks the value and shows while the slider has focus.
        </Text>
      </Stack>
    );
  },
};

/**
 * A value bubble on the thumb: driven from hover on an enclosing element
 * plus thumb focus.
 */
export const ThumbTooltip: Story = {
  render: () => {
    const [value, setValue] = useState(30);
    const [isFocused, setFocused] = useState(false);
    const [isHovered, setHovered] = useState(false);
    return (
      <Box
        maxW="md"
        // Headroom so the tooltip isn't clipped by the top of the canvas.
        pt="10"
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
              insetStart: 0,
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
              insetEnd: 0,
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

/**
 * `aria-describedby` reaches the thumb's input, so it's announced with the
 * slider: for example, to describe threshold marks drawn on the track.
 */
export const Description: Story = {
  parameters: {
    a11y: {
      config: {
        rules: [
          // Story parameters replace the preview's rules array.
          { id: "color-contrast", reviewOnFail: true },
          // This best-practice rule only counts a <label> element as a label,
          // so it fails any aria-label'd input that also has a description.
          { id: "label-title-only", enabled: false },
        ],
      },
    },
  },
  render: () => {
    const [value, setValue] = useState(50);
    return (
      <Stack maxW="md">
        <Slider
          aria-label="Sound level"
          aria-describedby="sound-thresholds"
          value={value}
          onChange={setValue}
          maxValue={255}
        />
        <Text id="sound-thresholds" fontSize="sm" color="gray.600">
          Quiet 50, loud 150
        </Text>
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
