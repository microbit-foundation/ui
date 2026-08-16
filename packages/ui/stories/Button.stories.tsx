/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Fragment, useState } from "react";
import { RiDownload2Line } from "react-icons/ri";
import {
  Button,
  ButtonGroup,
  darkSurface,
  Grid,
  HStack,
  MenuItem,
  MenuList,
  MenuTrigger,
  MoreMenuButton,
  Stack,
  Text,
} from "../src";

const variants = [
  "primary",
  "secondary",
  "ghost",
  "link",
  "plain",
  "neutral",
  "solid",
  "outline",
  "toolbar",
] as const;

const tones = ["brand", "danger"] as const;

const meta = {
  title: "Buttons/Button",
  component: Button,
  args: { children: "Button", variant: "secondary" },
  argTypes: {
    variant: { control: "select", options: variants },
    tone: { control: "select", options: tones },
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
 *
 * `ghost`, `plain` and `toolbar` are indistinguishable on the light strip
 * and only separate on the dark one, where `ghost` is black on black and
 * `plain` takes the page's text colour unless the bar sets one. Both are
 * light-surface variants; `toolbar` is the on-dark one.
 *
 * `solid` and `outline` show their default `brand` tone here — see Tones.
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

/**
 * `tone` picks the palette behind the `solid` and `outline` shapes; every
 * other variant ignores it. Apps add their own tones in their preset (each
 * palette must carry the 50/500/600/700 stops the shapes read — see
 * Button.recipe.ts).
 */
export const Tones: Story = {
  render: (args) => (
    <Stack gap={4} alignItems="start">
      {tones.map((tone) => (
        <HStack key={tone} gap={4} alignItems="center">
          <Button {...args} variant="solid" tone={tone}>
            solid {tone}
          </Button>
          <Button {...args} variant="outline" tone={tone}>
            outline {tone}
          </Button>
        </HStack>
      ))}
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

/**
 * Attached, the buttons divide by a hairline while the variant's own border
 * stays as the group's outline — compare `secondary`'s 2px edge with its 1px
 * seams. A variant with no border divides by a gap instead, so the last
 * group's seams are the dark surface showing through.
 *
 * Tab through: each button keeps its own border, so the ring sits square on
 * the one it belongs to, and flips to white on the tagged surface.
 */
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
      <ButtonGroup isAttached>
        <Button variant="primary">Left</Button>
        <Button variant="primary">Middle</Button>
        <Button variant="primary">Right</Button>
      </ButtonGroup>
      <ButtonGroup isAttached>
        <Button variant="neutral">Left</Button>
        <Button variant="neutral">Middle</Button>
        <Button variant="neutral">Right</Button>
      </ButtonGroup>
      <HStack
        css={{ p: 4, bg: "brand.600", borderRadius: "md" }}
        {...darkSurface}
      >
        <ButtonGroup isAttached>
          <Button variant="neutral">Left</Button>
          <Button variant="neutral">Middle</Button>
          <Button variant="neutral">Right</Button>
        </ButtonGroup>
      </HStack>
    </Stack>
  ),
};

/**
 * A split button: a main action plus a MoreMenuButton in a MenuTrigger, both
 * in an attached group and both on the same variant. The seam needs no
 * per-call-site styling.
 */
export const Split: Story = {
  render: (args) => (
    <Stack gap={4} alignItems="start">
      {(["secondary", "primary"] as const).map((variant) => (
        <ButtonGroup key={variant} isAttached>
          <Button {...args} variant={variant} leftIcon={<RiDownload2Line />}>
            Save
          </Button>
          <MenuTrigger>
            <MoreMenuButton variant={variant} aria-label="More save options" />
            <MenuList>
              <MenuItem>Save Python script</MenuItem>
            </MenuList>
          </MenuTrigger>
        </ButtonGroup>
      ))}
    </Stack>
  ),
};

const sizes = ["xs", "sm", "md", "lg"] as const;

const MoreMenu = ({ size }: { size: (typeof sizes)[number] }) => (
  <MenuTrigger>
    <MoreMenuButton
      variant="secondary"
      size={size}
      aria-label="More save options"
    />
    <MenuList>
      <MenuItem>Save Python script</MenuItem>
    </MenuList>
  </MenuTrigger>
);

/**
 * MoreMenuButton's glyph is optically centred against whichever corners the
 * group has squared, so the dots sit in the middle of the ink rather than of
 * the box. Trailing (the usual arrangement) and leading lean towards their
 * flat edge; middle and alone are symmetric and stay put.
 *
 * The correction is a share of the width, not a length, so it holds at every
 * size — the shape is the same at all four.
 */
export const SplitSizes: Story = {
  render: () => (
    <Grid
      gridTemplateColumns="repeat(5, max-content)"
      gap={6}
      alignItems="center"
      justifyItems="start"
    >
      {["", "trailing", "leading", "middle", "alone"].map((heading) => (
        <Text key={heading} fontSize="xs" color="gray.600">
          {heading}
        </Text>
      ))}
      {sizes.map((size) => (
        <Fragment key={size}>
          <Text fontSize="xs" color="gray.600">
            {size}
          </Text>
          <ButtonGroup isAttached>
            <Button variant="secondary" size={size}>
              Save
            </Button>
            <MoreMenu size={size} />
          </ButtonGroup>
          <ButtonGroup isAttached>
            <MoreMenu size={size} />
            <Button variant="secondary" size={size}>
              Save
            </Button>
          </ButtonGroup>
          <ButtonGroup isAttached>
            <Button variant="secondary" size={size}>
              Save
            </Button>
            <MoreMenu size={size} />
            <Button variant="secondary" size={size}>
              Export
            </Button>
          </ButtonGroup>
          <MoreMenu size={size} />
        </Fragment>
      ))}
    </Grid>
  ),
};
