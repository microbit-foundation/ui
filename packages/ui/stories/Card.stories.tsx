/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Card,
  CardBody,
  Heading,
  HStack,
  LinkBox,
  LinkOverlay,
  Text,
  VStack,
} from "../src";

const meta = {
  title: "Surfaces/Card",
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  render: () => (
    <HStack gap={6} alignItems="stretch">
      {(["elevated", "outline"] as const).map((variant) => (
        <Card key={variant} variant={variant} css={{ maxW: "xs" }}>
          <CardBody>
            <VStack alignItems="stretch" gap={2}>
              <Heading size="md">{variant}</Heading>
              <Text>Cards compose the heading, text and link primitives.</Text>
            </VStack>
          </CardBody>
        </Card>
      ))}
    </HStack>
  ),
};

/** LinkBox/LinkOverlay make the whole card the link's hit area. */
export const ClickableCard: Story = {
  render: () => (
    <LinkBox maxW="xs">
      <Card
        variant="outline"
        css={{
          transitionProperty: "box-shadow",
          transitionDuration: "normal",
          _hover: { boxShadow: "md" },
        }}
      >
        <CardBody>
          <VStack alignItems="stretch" gap={2}>
            <Heading size="md">
              <LinkOverlay href="#">Project name</LinkOverlay>
            </Heading>
            <Text>The whole card is clickable via the LinkOverlay.</Text>
          </VStack>
        </CardBody>
      </Card>
    </LinkBox>
  ),
};
