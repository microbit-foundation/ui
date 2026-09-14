/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box } from "@microbit/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  defaultSortDirection,
  ProjectSortField,
  ProjectSortDirection,
  ProjectSortInput,
} from "../src";

const meta = {
  title: "Projects/ProjectSortInput",
  component: ProjectSortInput,
  decorators: [
    (Story) => (
      <Box p={4}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof ProjectSortInput>;
export default meta;

type Story = StoryObj<typeof meta>;

const Controlled = ({ hasSearchQuery }: { hasSearchQuery: boolean }) => {
  const [field, setField] = useState<ProjectSortField>("timestamp");
  const [direction, setDirection] = useState<ProjectSortDirection>("desc");
  return (
    <ProjectSortInput
      field={field}
      direction={direction}
      onFieldChange={(next) => {
        setField(next);
        setDirection(defaultSortDirection(next));
      }}
      onToggleDirection={() =>
        setDirection((d) => (d === "asc" ? "desc" : "asc"))
      }
      hasSearchQuery={hasSearchQuery}
    />
  );
};

const args = {
  field: "timestamp" as const,
  direction: "desc" as const,
  onFieldChange: () => {},
  onToggleDirection: () => {},
  hasSearchQuery: false,
};

export const Default: Story = {
  args,
  render: () => <Controlled hasSearchQuery={false} />,
};

/** While searching the list is ranked by relevance and the controls rest. */
export const WhileSearching: Story = {
  args: { ...args, hasSearchQuery: true },
  render: () => <Controlled hasSearchQuery />,
};
