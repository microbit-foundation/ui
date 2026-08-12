/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, Button, HStack, Text, Tooltip, VStack } from "../src";

const meta = {
  title: "Overlays/Tooltip",
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <Tooltip label="Tooltips use the dark style" hasArrow>
      <Button variant="ghost">Hover me</Button>
    </Tooltip>
  ),
};

/**
 * Regression guard for the base preset leaving `body` unpositioned.
 *
 * react-aria portals tooltips and popovers to a static div at the end of
 * `<body>` and positions top placements with a CSS `bottom` computed against
 * the viewport height, on the assumption that a static body leaves the
 * viewport-sized initial containing block in charge. Give `body` a `position`
 * (Chakra's reset did) and on any page taller than the viewport the body
 * becomes the containing block instead, so that `bottom` resolves against the
 * document height and every top-placed overlay renders
 * (document − viewport) height too low. Placements that emit `top` — bottom,
 * left, right — don't show it, because the two containing blocks agree at the
 * document origin and only disagree at the bottom edge.
 *
 * Correct: the bubble sits on the button, partway down this three-screen-tall
 * page. Broken: it detaches downward — by the page's remaining scroll, so
 * anywhere from overlapping the button to screens adrift — and slides around
 * as you scroll.
 */
export const InAScrollingPage: Story = {
  render: () => (
    <VStack alignItems="flex-start" gap={4} css={{ minHeight: "300vh" }}>
      <Text>
        Scroll down to the button. Its tooltip is held open and must sit
        directly on it, arrow touching the button — if it sits below the
        button or slides around as you scroll, something (probably a
        `position` on `body`) has broken react-aria's overlay positioning.
      </Text>
      <Box css={{ marginTop: "120vh" }}>
        <Tooltip label="Anchored to the button, not the page" hasArrow isOpen>
          <Button variant="secondary">The tooltip belongs on me</Button>
        </Tooltip>
      </Box>
    </VStack>
  ),
};

export const Placements: Story = {
  render: () => (
    <HStack gap={4}>
      {(["top", "bottom", "left", "right"] as const).map((placement) => (
        <Tooltip
          key={placement}
          label={placement}
          placement={placement}
          hasArrow
        >
          <Button variant="secondary">{placement}</Button>
        </Tooltip>
      ))}
    </HStack>
  ),
};
