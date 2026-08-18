/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RiSearchLine } from "react-icons/ri";
import {
  Icon,
  Input,
  InputGroup,
  InputStartElement,
  InputEndElement,
  Kbd,
  Stack,
  TextField,
} from "../src";

const meta = {
  title: "Forms/TextField",
  component: TextField,
  args: { label: "Name" },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    helperText: { control: "text" },
    errorMessage: { control: "text" },
    isRequired: { control: "boolean" },
    isInvalid: { control: "boolean" },
    isDisabled: { control: "boolean" },
  },
} satisfies Meta<typeof TextField>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** The input recipe's size scale, shared with Input and NativeSelect. */
export const Sizes: Story = {
  render: () => (
    <Stack gap={6} maxW="md">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Input key={size} aria-label={size} placeholder={size} size={size} />
      ))}
    </Stack>
  ),
};

export const States: Story = {
  render: () => (
    <Stack gap={6} maxW="md">
      <TextField label="Name" helperText="As shown on the certificate" />
      <TextField label="Project name" isRequired />
      <TextField
        label="Slug"
        isInvalid
        defaultValue="my/project"
        errorMessage="Slugs cannot contain '/'"
      />
      <TextField label="Serial number" isDisabled defaultValue="0x9904" />
    </Stack>
  ),
};

/**
 * Input adornments use the raw Input + InputGroup parts
 * (InputStartElement/InputEndElement); pad the input to make room. The
 * elements take the same `size` as the input so the overlay box tracks the
 * field height.
 */
export const Adornments: Story = {
  render: () => (
    <Stack gap={6} maxW="md">
      <InputGroup>
        <InputStartElement>
          <Icon as={RiSearchLine} css={{ color: "gray.400" }} />
        </InputStartElement>
        <Input
          aria-label="Search"
          placeholder="Search"
          css={{ paddingStart: "10" }}
        />
      </InputGroup>
      <InputGroup>
        <Input
          aria-label="Search"
          placeholder="Search"
          css={{ paddingEnd: "10" }}
        />
        <InputEndElement>
          <Kbd>/</Kbd>
        </InputEndElement>
      </InputGroup>
      <InputGroup>
        <InputStartElement size="sm">
          <Icon as={RiSearchLine} css={{ color: "gray.400" }} />
        </InputStartElement>
        <Input
          aria-label="Search"
          placeholder="Search (sm)"
          size="sm"
          css={{ paddingStart: "8" }}
        />
      </InputGroup>
    </Stack>
  ),
};
