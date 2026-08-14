/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { RiDownload2Line } from "react-icons/ri";
import { Button, ButtonGroup, darkSurface, HStack, Stack } from "../src";

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

/**
 * Every variant on a light and a tagged-dark surface — tab through both
 * strips to see the focus ring flip ink/white.
 */
export const Variants: Story = {
  render: (args) => (
    <Stack gap={4} alignItems="stretch">
      <HStack gap={4} flexWrap="wrap" css={{ p: "4" }}>
        {variants.map((variant) => (
          <Button key={variant} {...args} variant={variant}>
            {variant}
          </Button>
        ))}
      </HStack>
      <HStack
        gap={4}
        flexWrap="wrap"
        css={{ p: "4", bg: "black", borderRadius: "md" }}
        {...darkSurface}
      >
        {variants.map((variant) => (
          <Button key={variant} {...args} variant={variant}>
            {variant}
          </Button>
        ))}
      </HStack>
    </Stack>
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

/**
 * `isLoading` centres a spinner over the label and disables the button, so it
 * takes the dimmed disabled look too. The label is hidden rather than removed,
 * so each button keeps the size it has when idle — compare the pairs below,
 * which stay put as you toggle.
 */
export const Loading: Story = {
  render: () => {
    const [isLoading, setLoading] = useState(true);
    return (
      <Stack gap={6} alignItems="start">
        <Button variant="secondary" onPress={() => setLoading(!isLoading)}>
          {isLoading ? "Stop loading" : "Start loading"}
        </Button>
        <HStack gap={4} alignItems="center">
          <Button variant="primary" isLoading={isLoading}>
            Save
          </Button>
          <Button variant="primary" isLoading={isLoading}>
            Save and close
          </Button>
          <Button
            variant="secondary"
            leftIcon={<RiDownload2Line />}
            isLoading={isLoading}
          >
            Download
          </Button>
          <Button variant="primary" size="sm" isLoading={isLoading}>
            Small
          </Button>
        </HStack>
      </Stack>
    );
  },
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
    </Stack>
  ),
};
