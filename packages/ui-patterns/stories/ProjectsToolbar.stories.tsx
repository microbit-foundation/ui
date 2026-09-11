/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box } from "@microbit/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProjectsToolbar } from "../src";

const meta = {
  title: "Projects/ProjectsToolbar",
  component: ProjectsToolbar,
  args: {
    selectedCount: 1,
    onRename: () => alert("rename"),
    onDuplicate: () => alert("duplicate"),
    onDelete: () => alert("delete"),
    onClearSelection: () => alert("clear"),
  },
  decorators: [
    (Story) => (
      <Box
        display="inline-block"
        bg="white"
        borderWidth="1px"
        borderColor="gray.200"
        borderRadius="lg"
      >
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof ProjectsToolbar>;
export default meta;

type Story = StoryObj<typeof meta>;

/** One project selected: rename and duplicate are offered. */
export const SingleSelection: Story = {};

/** Several selected: only delete (with the count) and clear. */
export const MultipleSelection: Story = {
  args: { selectedCount: 3 },
};

/** The narrow layout: icons only, detached, larger targets. */
export const IconOnly: Story = {
  args: { iconOnly: true, isAttached: false, size: "lg" },
};
