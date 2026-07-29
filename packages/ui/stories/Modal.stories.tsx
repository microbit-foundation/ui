/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  Button,
  ButtonGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  Text,
} from "../src";

const sizes = [
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
  "3xl",
  "4xl",
  "5xl",
  "6xl",
  "full",
] as const;

const meta = {
  title: "Overlays/Modal",
  args: { size: "md" as (typeof sizes)[number], isCentered: false },
  argTypes: {
    size: { control: "select", options: sizes },
    isCentered: { control: "boolean" },
  },
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: (args) => {
    const [isOpen, setOpen] = useState(false);
    return (
      <>
        <Button variant="primary" onPress={() => setOpen(true)}>
          Open modal
        </Button>
        <Modal {...args} isOpen={isOpen} onClose={() => setOpen(false)}>
          <ModalCloseButton />
          <ModalHeader>Modal title</ModalHeader>
          <ModalBody>
            <Text>
              Focus lands on the dialog itself on open, and returns to the
              trigger on close.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="primary" onPress={() => setOpen(false)}>
              Done
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );
  },
};

/** Chakra's AlertDialog: role="alertdialog" for interrupting confirmations. */
export const AlertDialog: Story = {
  render: () => {
    const [isOpen, setOpen] = useState(false);
    return (
      <>
        <Button variant="warning" onPress={() => setOpen(true)}>
          Delete project
        </Button>
        <Modal
          role="alertdialog"
          size="sm"
          isOpen={isOpen}
          onClose={() => setOpen(false)}
        >
          <ModalHeader>Delete project?</ModalHeader>
          <ModalBody>
            <Text>This cannot be undone.</Text>
          </ModalBody>
          <ModalFooter>
            <ButtonGroup>
              <Button variant="secondary" onPress={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="warningSolid" onPress={() => setOpen(false)}>
                Delete
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </Modal>
      </>
    );
  },
};
