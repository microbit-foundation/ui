/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, Button, ConfirmDialog, Text, useDisclosure } from "../src";

const meta = {
  title: "Overlays/ConfirmDialog",
  component: ConfirmDialog,
} satisfies Meta<typeof ConfirmDialog>;
export default meta;

type Story = StoryObj<typeof meta>;

const Harness = ({ confirmText }: { confirmText: string }) => {
  const disclosure = useDisclosure();
  return (
    <Box height="100vh" p={4}>
      <Button variant="secondary" onPress={disclosure.onOpen}>
        Delete project
      </Button>
      <ConfirmDialog
        isOpen={disclosure.isOpen}
        heading="Confirm delete project"
        body={<Text>Are you sure you want to delete the project "Heart"?</Text>}
        confirmText={confirmText}
        onConfirm={() => {
          alert("deleted");
          disclosure.onClose();
        }}
        onCancel={disclosure.onClose}
      />
    </Box>
  );
};

const args = {
  isOpen: true,
  heading: "Confirm delete project",
  body: "",
  confirmText: "Delete",
  onConfirm: () => {},
  onCancel: () => {},
};

/** Cancel takes focus first; the confirm verb is styled as dangerous. */
export const Default: Story = {
  args,
  render: () => <Harness confirmText="Delete" />,
};
