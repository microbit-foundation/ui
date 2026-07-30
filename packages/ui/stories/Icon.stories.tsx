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
import { HStack, Icon, Stack, Text } from "../src";

const meta = {
  title: "Media & icons/Icon",
  component: Icon,
  // The render below supplies real icons; this just satisfies Icon's
  // required `as` for the args type.
  args: { as: RiDownload2Line },
} satisfies Meta<typeof Icon>;
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
