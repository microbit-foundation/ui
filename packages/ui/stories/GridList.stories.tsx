/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { MdMoreVert } from "react-icons/md";
import {
  Avatar,
  GridList,
  GridListItem,
  HStack,
  IconButton,
  Key,
  MenuItem,
  MenuList,
  MenuTrigger,
  Selection,
  Text,
} from "../src";

const PEOPLE = [
  "Ada Lovelace",
  "Grace Hopper",
  "Alan Turing",
  "Katherine Johnson",
];

const meta = {
  title: "Data display/GridList",
  component: GridList,
  // Every story renders its own list; `children` is required by the type.
  args: { "aria-label": "People", children: null },
} satisfies Meta<typeof GridList>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <GridList
      aria-label="People"
      selectionMode="single"
      css={{ width: "20rem" }}
    >
      {PEOPLE.map((name) => (
        <GridListItem
          key={name}
          id={name}
          textValue={name}
          css={{ px: 3, py: 2 }}
        >
          <Text>{name}</Text>
        </GridListItem>
      ))}
    </GridList>
  ),
};

/**
 * The reason to choose a GridList over a ListBox: each row owns controls that
 * are reachable by keyboard without leaving the row.
 */
export const RowsWithControls: Story = {
  render: function RowsWithControls() {
    const [selected, setSelected] = useState<Selection>(
      () => new Set<Key>(["Ada Lovelace"]),
    );
    return (
      <GridList
        aria-label="People"
        selectionMode="single"
        selectionBehavior="replace"
        disallowEmptySelection
        selectedKeys={selected}
        onSelectionChange={setSelected}
        css={{ width: "22rem" }}
      >
        {PEOPLE.map((name) => (
          <GridListItem
            key={name}
            id={name}
            textValue={name}
            css={{ px: 3, py: 2, gap: 3, borderRadius: "xl" }}
          >
            <Avatar aria-hidden name={name} size="sm" />
            <Text>{name}</Text>
            <HStack css={{ marginStart: "auto" }}>
              <MenuTrigger>
                <IconButton aria-label={`Actions for ${name}`} variant="ghost">
                  <MdMoreVert />
                </IconButton>
                <MenuList>
                  <MenuItem textValue="Rename">Rename</MenuItem>
                  <MenuItem textValue="Remove">Remove</MenuItem>
                </MenuList>
              </MenuTrigger>
            </HStack>
          </GridListItem>
        ))}
      </GridList>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <GridList
      aria-label="People"
      selectionMode="single"
      disabledKeys={["Alan Turing"]}
      css={{ width: "20rem" }}
    >
      {PEOPLE.map((name) => (
        <GridListItem
          key={name}
          id={name}
          textValue={name}
          css={{ px: 3, py: 2 }}
        >
          <Text>{name}</Text>
        </GridListItem>
      ))}
    </GridList>
  ),
};
