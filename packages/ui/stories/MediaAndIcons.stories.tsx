/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  RiDownload2Line,
  RiErrorWarningLine,
  RiHeartFill,
} from "react-icons/ri";
import { HStack, Icon, Image, Stack, Svg, Text } from "../src";

const meta = {
  title: "Media & icons",
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Icons: Story = {
  render: () => (
    <Stack gap={4}>
      <HStack gap={4} alignItems="center">
        <Icon as={RiDownload2Line} />
        <Icon as={RiDownload2Line} css={{ fontSize: "2xl" }} />
        <Icon as={RiHeartFill} css={{ fontSize: "3xl", color: "red.500" }} />
      </HStack>
      <HStack gap={2} alignItems="center">
        <Icon
          as={RiErrorWarningLine}
          aria-label="Warning"
          css={{ color: "orange.500" }}
        />
        <Text fontSize="sm" color="gray.600">
          Icons are aria-hidden unless given an aria-label.
        </Text>
      </HStack>
    </Stack>
  ),
};

export const ImageStory: Story = {
  name: "Image",
  render: () => (
    <Image
      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='180'%3E%3Crect width='320' height='180' fill='%23343a40'/%3E%3Ccircle cx='120' cy='90' r='16' fill='%23fff'/%3E%3Ccircle cx='200' cy='90' r='16' fill='%23fff'/%3E%3C/svg%3E"
      alt="Placeholder graphic"
      borderRadius="lg"
      maxW="xs"
    />
  ),
};

export const SvgStory: Story = {
  name: "Svg",
  render: () => (
    <Svg viewBox="0 0 24 24" fontSize="4xl" color="blue.600" aria-hidden>
      <path
        fill="currentColor"
        d="M12 21 4 13.5a5.5 5.5 0 1 1 8-7.6 5.5 5.5 0 1 1 8 7.6Z"
      />
    </Svg>
  ),
};
