/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RiCheckLine, RiTeamLine } from "react-icons/ri";
import { Avatar, AvatarBadge, HStack, Stack, Text } from "../src";

const meta = {
  title: "Data display/Avatar",
  component: Avatar,
  args: { name: "Ada Lovelace" },
  argTypes: {
    size: {
      control: "select",
      options: ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"],
    },
    showBorder: { control: "boolean" },
  },
} satisfies Meta<typeof Avatar>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <HStack gap={4} alignItems="center">
      {(["2xs", "xs", "sm", "md", "lg", "xl", "2xl"] as const).map((size) => (
        <Avatar key={size} size={size} name="Ada Lovelace" />
      ))}
    </HStack>
  ),
};

/**
 * The background is hashed from the name, so a roster reads as distinct
 * people, and the text flips to dark on the lighter results.
 */
export const Names: Story = {
  render: () => (
    <HStack gap={3}>
      {[
        "Ada Lovelace",
        "Grace Hopper",
        "Alan Turing",
        "Katherine Johnson",
        "Tim Berners-Lee",
      ].map((name) => (
        <Stack key={name} gap={1} alignItems="center">
          <Avatar name={name} />
          <Text size="sm">{name}</Text>
        </Stack>
      ))}
    </HStack>
  ),
};

/** No name: the generic glyph, or one supplied by the call site. */
export const Fallbacks: Story = {
  render: () => (
    <HStack gap={4}>
      <Avatar />
      <Avatar icon={<RiTeamLine />} iconLabel="Everyone" />
      <Avatar src="https://microbit.org/favicon.ico" name="micro:bit" />
    </HStack>
  ),
};

/**
 * A badge takes its size from the avatar's font size (`1.5em`), so one set of
 * numbers works at every size.
 */
export const Badges: Story = {
  render: () => (
    <HStack gap={4} alignItems="center">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Avatar key={size} size={size} name="Ada Lovelace">
          <AvatarBadge css={{ boxSize: "1.5em", bg: "green.500" }}>
            <RiCheckLine />
          </AvatarBadge>
        </Avatar>
      ))}
      <Avatar name="Grace Hopper">
        <AvatarBadge
          placement="top-end"
          css={{ boxSize: "1em", bg: "danger.500" }}
        />
      </Avatar>
    </HStack>
  ),
};

/**
 * A `css` prop beats the derived colour — the recipe reads it through a
 * custom property so that an override at the call site wins.
 */
export const Overridden: Story = {
  render: () => (
    <HStack gap={4}>
      <Avatar name="Ada Lovelace" />
      <Avatar name="Ada Lovelace" css={{ bg: "gray.200", color: "gray.600" }} />
      <Avatar
        name="Ada Lovelace"
        showBorder
        css={{ borderColor: "brand.500" }}
      />
    </HStack>
  ),
};
