/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { Box, ProgressBar, Stack, Text } from "../src";

const meta = {
  title: "Feedback/ProgressBar",
  component: ProgressBar,
  args: { "aria-label": "Progress", value: 60 },
} satisfies Meta<typeof ProgressBar>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <Box maxW="md">
      <ProgressBar {...args} />
    </Box>
  ),
};

export const BarColour: Story = {
  render: () => (
    <Stack gap={6} maxW="md">
      <ProgressBar aria-label="Progress" value={60} />
      <ProgressBar
        aria-label="Download"
        value={80}
        barCss={{ bg: "green.500" }}
      />
    </Stack>
  ),
};

/**
 * Repeatedly fills over one second, the shortest fill any consumer asks for.
 * Watch the fill against the printed value: the static stories above can't
 * show how it tracks a value that moves.
 */
export const Ramp: Story = {
  render: () => {
    const value = useRamp(1000);
    return (
      <Stack gap={2} maxW="md">
        <ProgressBar
          aria-label="Recording"
          value={value}
          barCss={{ bg: "red.500" }}
        />
        <Text fontSize="sm" color="gray.600">
          {value.toFixed(0)}%
        </Text>
      </Stack>
    );
  },
};

/**
 * The same fill driven by coarse, irregular jumps rather than a smooth ramp —
 * what a consumer gets when progress comes from data arriving in batches
 * rather than from a clock. The steps belong to the value, not the component.
 */
export const SteppedUpdates: Story = {
  render: () => {
    const [value, setValue] = useState(0);
    useEffect(() => {
      const interval = setInterval(() => {
        setValue((previous) => (previous >= 100 ? 0 : previous + 12.5));
      }, 250);
      return () => clearInterval(interval);
    }, []);
    return (
      <Stack gap={2} maxW="md">
        <ProgressBar aria-label="Recording" value={value} />
        <Text fontSize="sm" color="gray.600">
          {value.toFixed(0)}%
        </Text>
      </Stack>
    );
  },
};

/**
 * Drive a value from 0 to 100 over `durationMs`, restarting on completion.
 */
const useRamp = (durationMs: number) => {
  const [value, setValue] = useState(0);
  const start = useRef(0);
  useEffect(() => {
    let frame = 0;
    const tick = (now: number) => {
      if (!start.current) {
        start.current = now;
      }
      const elapsed = now - start.current;
      if (elapsed >= durationMs) {
        start.current = now;
        setValue(100);
      } else {
        setValue((elapsed / durationMs) * 100);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [durationMs]);
  return value;
};
