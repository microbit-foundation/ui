/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RiCheckLine } from "react-icons/ri";
import {
  Avatar,
  AvatarBadge,
  Checkbox,
  ListBox,
  ListBoxOption,
  Stack,
  Text,
} from "../src";

const PEOPLE = ["Ada Lovelace", "Grace Hopper", "Alan Turing"];

const meta = {
  title: "Data display/ListBox",
  component: ListBox,
  // Every story renders its own list; `children` is required by the type.
  args: { "aria-label": "People", children: null },
} satisfies Meta<typeof ListBox>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <ListBox
      aria-label="People"
      selectionMode="single"
      css={{ width: "20rem" }}
    >
      {PEOPLE.map((name) => (
        <ListBoxOption key={name} id={name} css={{ px: 3, py: 2 }}>
          {name}
        </ListBoxOption>
      ))}
    </ListBox>
  ),
};

export const MultipleSelection: Story = {
  render: () => (
    <ListBox
      aria-label="People"
      selectionMode="multiple"
      defaultSelectedKeys={["Grace Hopper"]}
      css={{ width: "20rem" }}
    >
      {PEOPLE.map((name) => (
        <ListBoxOption key={name} id={name} css={{ px: 3, py: 2 }}>
          {name}
        </ListBoxOption>
      ))}
    </ListBox>
  ),
};

/**
 * Selection drawn by the rows rather than by a background — with a matching
 * "all of them" toggle above, which is a `Checkbox` whose control is its own
 * content (`control={false}`).
 */
export const CustomSelectedState: Story = {
  render: () => (
    <Stack gap={2} css={{ width: "20rem" }}>
      <Checkbox
        aria-label="Everyone"
        control={false}
        defaultSelected
        css={{
          gap: 3,
          p: 1,
          borderRadius: "md",
          "&[data-focus-visible]": { focusShadow: "outline" },
        }}
      >
        {({ isSelected }) => (
          <>
            <Avatar aria-hidden size="sm">
              {isSelected && (
                <AvatarBadge css={{ boxSize: "1.5em", bg: "green.500" }}>
                  <RiCheckLine />
                </AvatarBadge>
              )}
            </Avatar>
            <Text>Everyone</Text>
          </>
        )}
      </Checkbox>
      <ListBox aria-label="People" selectionMode="multiple">
        {PEOPLE.map((name) => (
          <ListBoxOption
            key={name}
            id={name}
            textValue={name}
            css={{
              gap: 3,
              p: 1,
              my: 1,
              borderRadius: "md",
              bg: "transparent",
              _hover: { bg: "transparent" },
              "&[data-selected]": { bg: "transparent" },
            }}
          >
            {({ isSelected }) => (
              <>
                <Avatar aria-hidden name={name} size="sm">
                  {isSelected && (
                    <AvatarBadge css={{ boxSize: "1.5em", bg: "green.500" }}>
                      <RiCheckLine />
                    </AvatarBadge>
                  )}
                </Avatar>
                <Text>{name}</Text>
              </>
            )}
          </ListBoxOption>
        ))}
      </ListBox>
    </Stack>
  ),
};
