/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  Button,
  Code,
  HStack,
  Input,
  Stack,
  Text,
  useBreakpointValue,
  useClipboard,
  useMediaQuery,
  usePrevious,
} from "../src";

const meta = {
  title: "Hooks",
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const UseClipboard: Story = {
  name: "useClipboard",
  render: () => {
    const value = "BBC micro:bit";
    const { onCopy, hasCopied } = useClipboard(value);
    return (
      <HStack gap={2} maxW="md">
        <Input aria-label="Value to copy" value={value} readOnly />
        <Button variant="secondary" onPress={onCopy}>
          {hasCopied ? "Copied!" : "Copy"}
        </Button>
      </HStack>
    );
  },
};

export const UseMediaQuery: Story = {
  name: "useMediaQuery",
  render: () => {
    const isNarrow = useMediaQuery("(max-width: 600px)");
    return (
      <Text maxW="md">
        <Code>(max-width: 600px)</Code> currently matches:{" "}
        <Code>{String(isNarrow)}</Code> — resize the viewport to see it change.
      </Text>
    );
  },
};

export const UseBreakpointValue: Story = {
  name: "useBreakpointValue",
  render: () => {
    const breakpoint = useBreakpointValue({
      base: "base",
      sm: "sm",
      md: "md",
      lg: "lg",
      xl: "xl",
      "2xl": "2xl",
    });
    return (
      <Text maxW="md">
        Active breakpoint: <Code>{breakpoint}</Code> — resize the viewport to
        see it change.
      </Text>
    );
  },
};

export const UsePrevious: Story = {
  name: "usePrevious",
  render: () => {
    const [count, setCount] = useState(0);
    const previous = usePrevious(count);
    return (
      <Stack gap={4} alignItems="start">
        <Button variant="secondary" onPress={() => setCount(count + 1)}>
          Increment
        </Button>
        <Text>
          Current: <Code>{count}</Code>, previous render:{" "}
          <Code>{String(previous)}</Code>
        </Text>
      </Stack>
    );
  },
};
