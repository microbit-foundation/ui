/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Code,
  Divider,
  Heading,
  HStack,
  Kbd,
  Link,
  List,
  ListItem,
  Stack,
  Text,
  VStack,
} from "../src";

const meta = {
  title: "Typography",
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

const headingSizes = [
  "4xl",
  "3xl",
  "2xl",
  "xl",
  "lg",
  "md",
  "sm",
  "xs",
] as const;

export const Headings: Story = {
  render: () => (
    <VStack alignItems="stretch" gap={3}>
      {headingSizes.map((size) => (
        <Heading key={size} size={size}>
          Heading {size}
        </Heading>
      ))}
      <Heading size="lg" variant="marketing">
        Marketing heading (display font)
      </Heading>
    </VStack>
  ),
};

export const TextAndLink: Story = {
  render: () => (
    <Stack gap={3} maxW="lg">
      <Text>
        Body text with an inline <Link href="#">link</Link>, using the Chakra v2
        design language on Panda CSS.
      </Text>
      <Text fontSize="sm" color="gray.600">
        Text takes Panda style props for one-off size and colour tweaks.
      </Text>
    </Stack>
  ),
};

export const CodeAndKbd: Story = {
  render: () => (
    <Stack gap={3} maxW="lg">
      <Text>
        Install with <Code>npm install @microbit/ui</Code> and import from{" "}
        <Code>@microbit/ui</Code>.
      </Text>
      <Text>
        Press <Kbd>Ctrl</Kbd> + <Kbd>C</Kbd> to copy, or <Kbd>⌘</Kbd> +{" "}
        <Kbd>C</Kbd> on a Mac.
      </Text>
    </Stack>
  ),
};

export const Lists: Story = {
  render: () => (
    <List css={{ display: "flex", flexDirection: "column", gap: "2" }}>
      <ListItem>Lists render without markers, as Chakra's did</ListItem>
      <ListItem>Spacing is per call site via style props</ListItem>
      <ListItem>ListItem is a styled li</ListItem>
    </List>
  ),
};

export const DividerStory: Story = {
  name: "Divider",
  render: () => (
    <Stack gap={4} maxW="md">
      <Text>Content above the divider.</Text>
      <Divider />
      <Text>Content below the divider.</Text>
      <HStack gap={4} alignItems="stretch" h="8">
        <Text>Left</Text>
        <Divider orientation="vertical" />
        <Text>Right</Text>
      </HStack>
    </Stack>
  ),
};
