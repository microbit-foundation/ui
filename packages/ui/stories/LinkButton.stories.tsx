/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RiExternalLinkLine } from "react-icons/ri";
import { Button, HStack, Icon, LinkButton } from "../src";

const variants = [
  "primary",
  "secondary",
  "ghost",
  "link",
  "plain",
  "warning",
  "warningSolid",
  "toolbar",
] as const;

const meta = {
  title: "Buttons/LinkButton",
  component: LinkButton,
  args: {
    children: "Link button",
    variant: "primary",
    href: "https://microbit.org/",
    target: "_blank",
  },
  argTypes: {
    variant: { control: "select", options: variants },
    size: { control: "select", options: ["xs", "sm", "md", "lg"] },
    isDisabled: { control: "boolean" },
  },
} satisfies Meta<typeof LinkButton>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: (args) => (
    <HStack gap={4} flexWrap="wrap">
      {variants.map((variant) => (
        <LinkButton key={variant} {...args} variant={variant}>
          {variant}
        </LinkButton>
      ))}
    </HStack>
  ),
};

// The motivating case (python-editor's FirmwareDialog): an external help
// page presented as the dialog's primary action alongside real Buttons.
export const AmongButtons: Story = {
  render: (args) => (
    <HStack gap={4}>
      <Button size="lg">Cancel</Button>
      <Button size="lg">Try again</Button>
      <LinkButton
        {...args}
        size="lg"
        rightIcon={<Icon as={RiExternalLinkLine} />}
      >
        Update firmware
      </LinkButton>
    </HStack>
  ),
};
