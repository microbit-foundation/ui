/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, Button, useDisclosure } from "@microbit/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ReactNode } from "react";
import { NameProjectDialog, NameProjectDialogProps } from "../src";

const meta = {
  title: "Projects/NameProjectDialog",
  component: NameProjectDialog,
} satisfies Meta<typeof NameProjectDialog>;
export default meta;

type Story = StoryObj<typeof meta>;

type HarnessProps = Omit<
  NameProjectDialogProps,
  "isOpen" | "onClose" | "onSave" | "confirmText"
> &
  Partial<Pick<NameProjectDialogProps, "confirmText">>;

const Harness = (props: HarnessProps) => {
  const disclosure = useDisclosure();
  return (
    <Box height="100vh" p={4}>
      <Button variant="secondary" onPress={disclosure.onOpen}>
        Open dialog
      </Button>
      <NameProjectDialog
        confirmText="Create"
        {...props}
        isOpen={disclosure.isOpen}
        onClose={disclosure.onClose}
        onSave={(name) => {
          alert(`saved: ${name}`);
          disclosure.onClose();
        }}
      />
    </Box>
  );
};

const args = {
  isOpen: true,
  onClose: () => {},
  onSave: () => {},
  initialName: "Untitled project",
  confirmText: "Create",
};

/** Naming a new project: the default heading. */
export const NewProject: Story = {
  args,
  render: ({ initialName }) => <Harness initialName={initialName} />,
};

/** With app-specific helper text under the field. */
export const WithHelperText: Story = {
  args,
  render: ({ initialName }) => (
    <Harness
      initialName={initialName}
      helperText="The name is used when you save a file."
    />
  ),
};

/** Renaming: the app passes the heading and confirm text. */
export const Rename: Story = {
  args: { ...args, initialName: "Heartbeat monitor" },
  render: ({ initialName }) => (
    <Harness
      initialName={initialName}
      heading={"Rename project" as ReactNode}
      confirmText="Rename"
    />
  ),
};
