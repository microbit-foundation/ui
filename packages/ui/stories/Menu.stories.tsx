/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { RiSettings2Line } from "react-icons/ri";
import {
  Button,
  MenuDivider,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  MenuTrigger,
} from "../src";

const meta = {
  title: "Overlays/Menu",
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <MenuTrigger>
      <Button variant="secondary" startIcon={<RiSettings2Line />}>
        Menu
      </Button>
      <MenuList>
        <MenuItem onAction={() => undefined}>First item</MenuItem>
        <MenuItem onAction={() => undefined}>Second item</MenuItem>
        <MenuItem isDisabled onAction={() => undefined}>
          Disabled item
        </MenuItem>
        <MenuDivider />
        <MenuItem onAction={() => undefined}>Delete</MenuItem>
      </MenuList>
    </MenuTrigger>
  ),
};

/**
 * MenuOptionGroup defaults to radio semantics for a section of the menu; action
 * items can sit alongside in the same menu.
 */
export const OptionGroups: Story = {
  render: () => {
    const [sort, setSort] = useState("name");
    return (
      <MenuTrigger>
        <Button variant="secondary">Sort: {sort}</Button>
        <MenuList>
          <MenuOptionGroup title="Sort by" value={sort} onChange={setSort}>
            <MenuItemOption value="name">Name</MenuItemOption>
            <MenuItemOption value="modified">Last modified</MenuItemOption>
            <MenuItemOption value="size">Size</MenuItemOption>
          </MenuOptionGroup>
          <MenuDivider />
          <MenuItem onAction={() => undefined}>Refresh</MenuItem>
        </MenuList>
      </MenuTrigger>
    );
  },
};

/**
 * `type="checkbox"` makes the options toggle independently, as
 * `menuitemcheckbox`. A lone toggle can equally be driven by the option's own
 * `onAction`, which fires on the press that unchecks it as well as the one that
 * checks it.
 */
export const CheckboxOptionGroup: Story = {
  render: () => {
    const [shown, setShown] = useState<string[]>(["grid"]);
    return (
      <MenuTrigger>
        <Button variant="secondary">View</Button>
        <MenuList>
          <MenuOptionGroup
            type="checkbox"
            title="Show"
            value={shown}
            onChange={setShown}
          >
            <MenuItemOption value="grid">Grid</MenuItemOption>
            <MenuItemOption value="rulers">Rulers</MenuItemOption>
          </MenuOptionGroup>
        </MenuList>
      </MenuTrigger>
    );
  },
};
