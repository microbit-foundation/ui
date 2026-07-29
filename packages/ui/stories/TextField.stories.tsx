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
  InputLeftElement,
  InputRightElement,
  Kbd,
  Stack,
  TextField,
} from "../src";

const meta = {
  title: "Forms/TextField",
  component: TextField,
  args: { label: "Name" },
  argTypes: {
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

export const States: Story = {
  render: () => (
    <Stack gap={6} maxW="md">
      <TextField label="Name" helperText="As shown on the certificate" />
      <TextField label="Project name" isRequired />
      <TextField
        label="Project name"
        isInvalid
        errorMessage="A project name is required"
      />
      <TextField label="Serial number" isDisabled defaultValue="0x9904" />
    </Stack>
  ),
};

/**
 * Input adornments use the raw Input + InputGroup parts (Chakra's
 * InputLeftElement/InputRightElement); pad the input to make room.
 */
export const Adornments: Story = {
  render: () => (
    <Stack gap={6} maxW="md">
      <InputGroup>
        <InputLeftElement>
          <Icon as={RiSearchLine} css={{ color: "gray.400" }} />
        </InputLeftElement>
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
        <InputRightElement>
          <Kbd>/</Kbd>
        </InputRightElement>
      </InputGroup>
    </Stack>
  ),
};
