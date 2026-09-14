/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, css } from "@microbit/ui";
import { ProjectCard } from "@microbit/ui-patterns";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ReactElement } from "react";
import { Carousel } from "../src";

const meta = {
  title: "Carousel/Project cards",
  component: Carousel,
} satisfies Meta<typeof Carousel>;
export default meta;

type Story = StoryObj<typeof meta>;

/** Stands in for an app's logo or glyph, as in the ProjectCard stories. */
const Glyph = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden
    className={css({ width: 12, height: 12, color: "brand.500", mt: 4 })}
  >
    <circle cx="12" cy="12" r="10" fill="currentColor" />
  </svg>
);

const names = [
  "Heartbeat monitor",
  "Radio messenger",
  "Step counter",
  "Night light",
  "Compass",
  "Emotion badge",
];

const projectCards = (count: number): ReactElement[] =>
  Array.from({ length: count }, (_, i) => (
    <Box key={i} minH="233px">
      <ProjectCard
        project={{
          id: String(i),
          name: names[i % names.length],
          timestamp: Date.now() - i * 86_400_000,
        }}
        onOpen={(id) => alert(`open ${id}`)}
        onRename={(id) => alert(`rename ${id}`)}
        onDuplicate={(id) => alert(`duplicate ${id}`)}
        onDelete={(id) => alert(`delete ${id}`)}
      >
        <Glyph />
      </ProjectCard>
    </Box>
  ));

/**
 * ProjectCards in the standard carousel, as an app home page lays out recent
 * projects. Unlike the example cards, whose only interaction navigates away,
 * each card's "…" menu opens an overlay in place — so any carousel movement
 * on click is visible under the open menu.
 *
 * Repro for the menu-click scroll: at a width where the prev/next buttons
 * show (≥768px, with more cards than fit), click the "…" menu on any card
 * past the current snap group — the carousel animates away while the menu
 * opens.
 */
export const ProjectCards: Story = {
  args: {
    carouselItems: projectCards(12),
    containerLabel: "My projects",
  },
};
