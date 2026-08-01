/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SVGProps } from "react";
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
      <HStack gap={2} alignItems="center">
        <Icon
          as={SvgrShapedIcon}
          css={{ fontSize: "2xl", color: "brand.500" }}
        />
        <Text fontSize="sm" color="gray.600">
          `as` also takes an svgr component (the shape of a <code>?react</code>{" "}
          svg import), not just react-icons.
        </Text>
      </HStack>
    </Stack>
  ),
};

/**
 * Stands in for `import X from "./x.svg?react"` — the same
 * `ComponentType<SVGProps<SVGSVGElement>>` shape, without needing svgr wired
 * into the library's own build. Its paths carry no `fill`, so they inherit
 * Icon's `fill: currentColor`.
 */
const SvgrShapedIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M12 2 2 22h20L12 2Zm0 6 6 12H6l6-12Z" />
  </svg>
);
