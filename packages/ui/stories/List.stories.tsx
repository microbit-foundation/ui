/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { List, ListItem, OrderedList, UnorderedList } from "../src";

const meta = {
  title: "Typography/List",
  component: List,
} satisfies Meta<typeof List>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Unstyled: Story = {
  render: () => (
    <List css={{ display: "flex", flexDirection: "column", gap: "2" }}>
      <ListItem>Lists render without markers, as Chakra's did</ListItem>
      <ListItem>Spacing is per call site via style props</ListItem>
      <ListItem>ListItem is a styled li</ListItem>
    </List>
  ),
};

export const Unordered: Story = {
  render: () => (
    <UnorderedList>
      <ListItem>Bulleted list matching Chakra's UnorderedList</ListItem>
      <ListItem>Disc markers with a 1em start margin</ListItem>
      <ListItem>ListItem is shared across all list variants</ListItem>
    </UnorderedList>
  ),
};

export const Ordered: Story = {
  render: () => (
    <OrderedList>
      <ListItem>Numbered list matching Chakra's OrderedList</ListItem>
      <ListItem>Decimal markers with a 1em start margin</ListItem>
      <ListItem>ListItem is shared across all list variants</ListItem>
    </OrderedList>
  ),
};
