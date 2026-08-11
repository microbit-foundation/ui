/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ReactNode } from "react";
import {
  AspectRatio,
  Center,
  Container,
  Grid,
  GridItem,
  HStack,
  Stack,
  Text,
  VStack,
  Wrap,
} from "../src";

const meta = {
  title: "Layout",
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

const Cell = ({ children }: { children?: ReactNode }) => (
  <Center bg="gray.100" borderRadius="md" px={4} py={3}>
    <Text fontSize="sm">{children}</Text>
  </Center>
);

export const Stacks: Story = {
  render: () => (
    <Stack gap={6} maxW="md">
      <HStack gap={2}>
        <Cell>HStack</Cell>
        <Cell>lays</Cell>
        <Cell>out</Cell>
        <Cell>horizontally</Cell>
      </HStack>
      <VStack gap={2} alignItems="stretch">
        <Cell>VStack</Cell>
        <Cell>lays out</Cell>
        <Cell>vertically</Cell>
      </VStack>
    </Stack>
  ),
};

export const GridLayout: Story = {
  render: () => (
    <Grid columns={3} gap={2} maxW="md">
      <GridItem colSpan={3}>
        <Cell>colSpan=3</Cell>
      </GridItem>
      <Cell>1</Cell>
      <Cell>2</Cell>
      <Cell>3</Cell>
      <GridItem colSpan={2}>
        <Cell>colSpan=2</Cell>
      </GridItem>
      <Cell>4</Cell>
    </Grid>
  ),
};

export const WrapLayout: Story = {
  render: () => (
    <Wrap gap={2} maxW="60">
      {Array.from({ length: 8 }, (_, i) => (
        <Cell key={i}>Item {i + 1}</Cell>
      ))}
    </Wrap>
  ),
};

/** Container centres itself and caps its width. */
export const ContainerLayout: Story = {
  render: () => (
    <Container maxW="md" bg="gray.100" borderRadius="md" px={4} py={3}>
      <Text fontSize="sm">
        A centred column capped at <code>maxW</code>.
      </Text>
    </Container>
  ),
};

export const AspectRatioLayout: Story = {
  render: () => (
    <AspectRatio ratio={16 / 9} maxW="md">
      <Center bg="gray.100" borderRadius="md">
        <Text fontSize="sm">16:9</Text>
      </Center>
    </AspectRatio>
  ),
};
