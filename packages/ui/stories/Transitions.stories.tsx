/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  Box,
  Button,
  Collapse,
  Fade,
  HStack,
  Slide,
  Stack,
  Text,
} from "../src";

const meta = {
  title: "Transitions",
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

const paragraph = (
  <Box bg="gray.100" borderRadius="md" p={4} maxW="md">
    <Text>
      Fully-collapsed content is hidden from the accessibility tree and tab
      order, and the height is measured with a ResizeObserver so nested
      expansion works.
    </Text>
  </Box>
);

export const CollapseStory: Story = {
  name: "Collapse",
  render: () => {
    const [isOpen, setOpen] = useState(false);
    return (
      <Stack gap={4} alignItems="start">
        <Button variant="secondary" onPress={() => setOpen(!isOpen)}>
          Toggle
        </Button>
        <Collapse isOpen={isOpen}>{paragraph}</Collapse>
      </Stack>
    );
  },
};

/** Chakra's "show more" pattern via startingHeight. */
export const CollapsePartial: Story = {
  render: () => {
    const [isOpen, setOpen] = useState(false);
    return (
      <Stack gap={4} alignItems="start" maxW="md">
        <Collapse isOpen={isOpen} startingHeight={50}>
          <Text>
            This text starts partially visible and expands to full height.
            Collapse transitions between the starting height and the measured
            content height, so the collapsed preview stays in the layout and the
            accessibility tree.
          </Text>
        </Collapse>
        <Button variant="link" onPress={() => setOpen(!isOpen)}>
          Show {isOpen ? "less" : "more"}
        </Button>
      </Stack>
    );
  },
};

export const FadeStory: Story = {
  name: "Fade",
  render: () => {
    const [isOpen, setOpen] = useState(true);
    return (
      <Stack gap={4} alignItems="start">
        <Button variant="secondary" onPress={() => setOpen(!isOpen)}>
          Toggle
        </Button>
        <Fade isOpen={isOpen}>{paragraph}</Fade>
      </Stack>
    );
  },
};

export const SlideStory: Story = {
  name: "Slide",
  render: () => {
    const [isOpen, setOpen] = useState(false);
    return (
      <>
        <Button variant="secondary" onPress={() => setOpen(!isOpen)}>
          Toggle panel
        </Button>
        <Slide isOpen={isOpen} css={{ bg: "gray.700", color: "white", p: 6 }}>
          <HStack gap={4} justifyContent="space-between">
            <Text>A bottom panel that slides in and out.</Text>
            <Button variant="secondary" onPress={() => setOpen(false)}>
              Close
            </Button>
          </HStack>
        </Slide>
      </>
    );
  },
};
