/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box } from "@microbit/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { SearchInput } from "../src";

const meta = {
  title: "Projects/SearchInput",
  component: SearchInput,
  decorators: [
    (Story) => (
      <Box w="30ch" p={4}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof SearchInput>;
export default meta;

type Story = StoryObj<typeof meta>;

const Controlled = ({ initial }: { initial: string }) => {
  const [value, setValue] = useState(initial);
  return <SearchInput value={value} onChange={setValue} />;
};

export const Empty: Story = {
  args: { value: "", onChange: () => {} },
  render: () => <Controlled initial="" />,
};

/** With text the clear button appears; clearing returns focus to the box. */
export const WithText: Story = {
  args: { value: "heart", onChange: () => {} },
  render: () => <Controlled initial="heart" />,
};
