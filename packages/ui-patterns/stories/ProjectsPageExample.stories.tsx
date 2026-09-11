/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Box,
  css,
  cx,
  Flex,
  Grid,
  HStack,
  Slide,
  Text,
  useBreakpointValue,
  VStack,
} from "@microbit/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, useState } from "react";
import {
  defaultSortDirection,
  ProjectCard,
  ProjectSortField,
  ProjectsToolbar,
  rankProjects,
  SearchInput,
  SortDirection,
  SortInput,
  sortProjects,
  useProjectActions,
  useProjectSelection,
} from "../src";

interface ExampleProject {
  id: string;
  name: string;
  timestamp: number;
  files: string[];
}

const day = 86_400_000;
const initialProjects: ExampleProject[] = [
  {
    id: "1",
    name: "Heart",
    timestamp: Date.now() - 2 * 3_600_000,
    files: ["main.py"],
  },
  {
    id: "2",
    name: "Heartbeat monitor",
    timestamp: Date.now() - day,
    files: ["main.py", "sensor.py"],
  },
  {
    id: "3",
    name: "Radio messenger",
    timestamp: Date.now() - 3 * day,
    files: ["main.py", "radio.py"],
  },
  {
    id: "4",
    name: "Step counter",
    timestamp: Date.now() - 12 * day,
    files: ["main.py"],
  },
  {
    id: "5",
    name: "Night light",
    timestamp: Date.now() - 40 * day,
    files: ["main.py", "light.py"],
  },
];

const Glyph = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden
    className={css({ width: 12, height: 12, color: "brand.500", mt: 4 })}
  >
    <circle cx="12" cy="12" r="10" fill="currentColor" />
  </svg>
);

/**
 * How an app composes the pieces into a projects page. Everything here is
 * app-side: the page layout, the grid, where the toolbar goes at each
 * width, and what rename, duplicate and delete actually do.
 */
const ProjectsPageExample = () => {
  const [projects, setProjects] = useState(initialProjects);
  const [query, setQuery] = useState("");
  const [field, setField] = useState<ProjectSortField>("timestamp");
  const [direction, setDirection] = useState<SortDirection>("desc");
  const selection = useProjectSelection(projects);
  const mobileIconOnly = useBreakpointValue({ base: true, md: false });

  const actions = useProjectActions({
    projects,
    getSelectedIds: () => selection.selectedIds,
    onRename: (id, name) =>
      setProjects((ps) => ps.map((p) => (p.id === id ? { ...p, name } : p))),
    onDuplicate: (id, name) =>
      setProjects((ps) => {
        const source = ps.find((p) => p.id === id)!;
        return [
          ...ps,
          { ...source, id: String(Date.now()), name, timestamp: Date.now() },
        ];
      }),
    onDelete: (ids) =>
      setProjects((ps) => ps.filter((p) => !ids.includes(p.id))),
  });

  const shown = useMemo(
    () =>
      query.trim()
        ? rankProjects(projects, query, (p) => p.files)
        : sortProjects(projects, field, direction),
    [direction, field, projects, query],
  );

  return (
    <>
      {actions.dialogs}
      <VStack as="main" alignItems="center" bg="whitesmoke" minH="100vh">
        <Box w="100%" maxW="1180px" p={4} display="flex" flexDir="column">
          <HStack mb={4} justifyContent="space-between" alignItems="center">
            <SearchInput
              value={query}
              onChange={(value) => {
                if (value.trim()) {
                  selection.clear();
                }
                setQuery(value);
              }}
              className={css({ maxW: "30ch" })}
            />
            {selection.hasSelection && (
              <Box
                display={{ base: "none", lg: "block" }}
                bg="white"
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="lg"
                ml="auto"
              >
                <ProjectsToolbar
                  selectedCount={selection.selectedIds.length}
                  onRename={actions.rename}
                  onDuplicate={actions.duplicate}
                  onDelete={actions.requestDelete}
                  onClearSelection={selection.clear}
                />
              </Box>
            )}
            <SortInput
              className={cx(
                css({ ml: "auto" }),
                selection.hasSelection
                  ? css({ display: { base: "flex", lg: "none" } })
                  : undefined,
              )}
              field={field}
              direction={direction}
              onFieldChange={(next) => {
                setField(next);
                setDirection(defaultSortDirection(next));
              }}
              onToggleDirection={() =>
                setDirection((d) => (d === "asc" ? "desc" : "asc"))
              }
              hasSearchQuery={!!query.trim()}
            />
          </HStack>
          {shown.length > 0 ? (
            <Grid
              gap={3}
              gridTemplateColumns={{
                base: "repeat(1, minmax(0, 1fr))",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(3, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr))",
              }}
              pb={selection.hasSelection ? { base: 16, lg: 0 } : 0}
            >
              {shown.map((project) => (
                <Box key={project.id} minH="233px">
                  <ProjectCard
                    project={project}
                    description={project.files.join(", ")}
                    isSelected={selection.isSelected(project.id)}
                    onSelected={selection.toggle}
                    onOpen={(id) => alert(`open ${id}`)}
                    onDelete={actions.requestDelete}
                    onRename={actions.rename}
                    onDuplicate={actions.duplicate}
                  >
                    <Glyph />
                  </ProjectCard>
                </Box>
              ))}
            </Grid>
          ) : (
            <Text p={12} textAlign="center">
              No projects to display
            </Text>
          )}
        </Box>
      </VStack>
      <Slide isOpen={selection.hasSelection} css={{ zIndex: 10 }}>
        <Flex
          justifyContent="center"
          display={{ base: "flex", lg: "none" }}
          bg="white"
          boxShadow="0 -2px 8px rgba(0,0,0,0.1)"
          borderTop="1px solid"
          borderColor="gray.200"
          py={2}
          px={4}
        >
          <ProjectsToolbar
            selectedCount={selection.lastSelectedIds.length}
            onRename={actions.rename}
            onDuplicate={actions.duplicate}
            onDelete={actions.requestDelete}
            onClearSelection={selection.clear}
            isAttached={false}
            iconOnly={mobileIconOnly}
            size="lg"
          />
        </Flex>
      </Slide>
    </>
  );
};

const meta = {
  title: "Projects/Page example",
  component: ProjectsPageExample,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ProjectsPageExample>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
