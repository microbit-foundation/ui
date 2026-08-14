/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RiSettings2Line } from "react-icons/ri";
import {
  CloseButton,
  darkSurface,
  HStack,
  IconButton,
  Stack,
  Text,
  VStack,
} from "../src";

const variants = ["primary", "secondary", "ghost", "plain", "toolbar"] as const;

const meta = {
  title: "Buttons/IconButton",
  component: IconButton,
  args: {
    "aria-label": "Settings",
    variant: "ghost",
    children: <RiSettings2Line />,
  },
  argTypes: {
    variant: {
      control: "select",
      options: variants,
    },
    size: { control: "select", options: ["xs", "sm", "md", "lg"] },
    isDisabled: { control: "boolean" },
  },
} satisfies Meta<typeof IconButton>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

// The label colour is a ternary of literals at the JSX site, not a
// forwarded prop: Panda can't extract a style prop through a wrapper.
const VariantRow = ({ onDark }: { onDark?: boolean }) => (
  <HStack gap={6} alignItems="start">
    {variants.map((variant) => (
      <VStack key={variant} gap={2}>
        <IconButton aria-label="Settings" variant={variant}>
          <RiSettings2Line />
        </IconButton>
        <Text fontSize="xs" color={onDark ? "gray.300" : "gray.600"}>
          {variant}
        </Text>
      </VStack>
    ))}
  </HStack>
);

/**
 * Both surfaces, as in Button's Variants — which explains why `ghost`,
 * `plain` and `toolbar` only separate on the dark strip.
 */
export const Variants: Story = {
  render: () => (
    <Stack gap={4} alignItems="stretch">
      <HStack css={{ p: "4" }}>
        <VariantRow />
      </HStack>
      <HStack
        css={{ p: "4", bg: "black", borderRadius: "md" }}
        {...darkSurface}
      >
        <VariantRow onDark />
      </HStack>
    </Stack>
  ),
};

export const CloseButtonStory: Story = {
  name: "CloseButton",
  render: () => (
    <HStack gap={6} alignItems="start">
      <VStack gap={2}>
        <CloseButton aria-label="Close" size="sm" />
        <Text fontSize="xs" color="gray.600">
          sm
        </Text>
      </VStack>
      <VStack gap={2}>
        <CloseButton aria-label="Close" />
        <Text fontSize="xs" color="gray.600">
          md
        </Text>
      </VStack>
      <VStack gap={2}>
        <CloseButton aria-label="Close" expandHitArea />
        <Text fontSize="xs" color="gray.600">
          expandHitArea
        </Text>
      </VStack>
    </HStack>
  ),
};
