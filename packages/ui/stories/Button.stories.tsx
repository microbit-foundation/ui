/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RiArrowDropDownLine, RiDownload2Line } from "react-icons/ri";
import { Button, ButtonGroup, HStack, IconButton, Stack } from "../src";

const variants = [
  "primary",
  "secondary",
  "ghost",
  "link",
  "plain",
  "warning",
  "warningSolid",
  "language",
  "toolbar",
] as const;

const meta = {
  title: "Buttons/Button",
  component: Button,
  args: { children: "Button", variant: "secondary" },
  argTypes: {
    variant: { control: "select", options: variants },
    size: { control: "select", options: ["xs", "sm", "md", "lg"] },
    isDisabled: { control: "boolean" },
  },
} satisfies Meta<typeof Button>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: (args) => (
    <HStack gap={4} flexWrap="wrap">
      {variants.map((variant) => (
        <Button key={variant} {...args} variant={variant}>
          {variant}
        </Button>
      ))}
    </HStack>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <HStack gap={4} alignItems="center">
      {(["xs", "sm", "md", "lg"] as const).map((size) => (
        <Button key={size} {...args} variant="primary" size={size}>
          {size}
        </Button>
      ))}
    </HStack>
  ),
};

export const WithIcon: Story = {
  args: {
    variant: "primary",
    leftIcon: <RiDownload2Line />,
    children: "Download",
  },
};

export const Disabled: Story = {
  args: { variant: "primary", isDisabled: true },
};

export const Grouped: Story = {
  render: () => (
    <Stack gap={4} alignItems="start">
      <ButtonGroup>
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary">Save</Button>
      </ButtonGroup>
      <ButtonGroup isAttached>
        <Button variant="secondary">Left</Button>
        <Button variant="secondary">Middle</Button>
        <Button variant="secondary">Right</Button>
      </ButtonGroup>
      {/* Split button: thin the joint's edges to 1px at the call site and
          the group's -1px overlap merges them into a single 1px seam
          (python-editor's Save/Send buttons). Full-width borders overlap
          too, as above, but 2px+2px reads as a chunky 3px joint. */}
      <ButtonGroup isAttached>
        <Button variant="secondary" css={{ borderRightWidth: "1px" }}>
          Save
        </Button>
        <IconButton
          variant="secondary"
          css={{ borderLeftWidth: "1px", fontSize: "2xl" }}
          aria-label="More save options"
        >
          <RiArrowDropDownLine />
        </IconButton>
      </ButtonGroup>
    </Stack>
  ),
};
