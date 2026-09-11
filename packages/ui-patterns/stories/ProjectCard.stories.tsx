/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, css, Grid } from "@microbit/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProjectCard } from "../src";

const meta = {
  title: "Projects/ProjectCard",
  component: ProjectCard,
  args: {
    project: {
      id: "p1",
      name: "Heartbeat monitor",
      timestamp: Date.now() - 3 * 3_600_000,
    },
    onOpen: (id) => alert(`open ${id}`),
    onDelete: (id) => alert(`delete ${id}`),
    onRenameDuplicate: (reason, id) => alert(`${reason} ${id}`),
  },
  decorators: [
    (Story) => (
      <Box w="260px" h="233px">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof ProjectCard>;
export default meta;

type Story = StoryObj<typeof meta>;

/** Stands in for an app's logo or glyph. */
const Glyph = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden
    className={css({ width: 12, height: 12, color: "brand.500", mt: 4 })}
  >
    <circle cx="12" cy="12" r="10" fill="currentColor" />
  </svg>
);

export const Default: Story = {
  args: { children: <Glyph /> },
};

/** A line under the name for what the project contains. */
export const WithDescription: Story = {
  args: { children: <Glyph />, description: "main.py, sensors.py" },
};

/** As on a projects page: selectable, with the hidden skip-to-toolbar link. */
export const Selectable: Story = {
  args: {
    children: <Glyph />,
    isSelected: true,
    onSelected: (id) => alert(`toggle ${id}`),
    onSkipToToolbar: () => alert("skip to toolbar"),
  },
};

export const LongName: Story = {
  args: {
    children: <Glyph />,
    project: {
      id: "p2",
      name: "A project with a name far too long to fit on the card",
      timestamp: Date.now() - 40 * 86_400_000,
    },
  },
};

/** Equal heights in a grid, as the projects page lays them out. */
export const InAGrid: Story = {
  decorators: [
    (Story) => (
      <Box w="100%" maxW="1180px">
        <Story />
      </Box>
    ),
  ],
  render: (args) => (
    <Grid gap={3} gridTemplateColumns="repeat(auto-fill, minmax(240px, 1fr))">
      {["Heart", "Radio messenger", "Step counter", "Night light"].map(
        (name, i) => (
          <Box key={name} minH="233px">
            <ProjectCard
              {...args}
              project={{
                id: String(i),
                name,
                timestamp: Date.now() - i * 86_400_000,
              }}
            >
              <Glyph />
            </ProjectCard>
          </Box>
        ),
      )}
    </Grid>
  ),
};
