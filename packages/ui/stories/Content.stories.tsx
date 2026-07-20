/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, Card, CardBody, Heading, Link, Text, VStack } from "../src";

const meta = {
  title: "Components/Content",
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Typography: Story = {
  render: () => (
    <VStack alignItems="stretch" gap={3} maxW="lg">
      <Heading size="2xl">Heading 2xl</Heading>
      <Heading size="lg">Heading lg</Heading>
      <Heading size="md">Heading md</Heading>
      <Text>
        Body text with an inline <Link href="#">link</Link>, using the Chakra v2
        design language on Panda CSS.
      </Text>
    </VStack>
  ),
};

export const CardSurface: Story = {
  render: () => (
    <Box maxW="md">
      <Card>
        <CardBody>
          <VStack alignItems="stretch" gap={2}>
            <Heading size="md">Card</Heading>
            <Text>Cards compose the heading, text and link primitives.</Text>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  ),
};
