/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { List, ListItem } from "../src";

const meta = {
  title: "Typography/List",
  component: List,
} satisfies Meta<typeof List>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <List css={{ display: "flex", flexDirection: "column", gap: "2" }}>
      <ListItem>Lists render without markers, as Chakra's did</ListItem>
      <ListItem>Spacing is per call site via style props</ListItem>
      <ListItem>ListItem is a styled li</ListItem>
    </List>
  ),
};
