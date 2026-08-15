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
  DialogTrigger,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  Text,
  useDialogClose,
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

/**
 * With a single trigger beside it, a dialog needs no state at all: wrap the
 * two in a `DialogTrigger` and react-aria holds it. A dialog opened from more
 * than one place — or from a menu item, or from a handler — wants the
 * controlled form above instead.
 */
export const WithTrigger: Story = {
  render: (args) => (
    <DialogTrigger>
      <Button variant="primary">Open</Button>
      <Modal {...args}>
        <ModalHeader>No state required</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>
            The trigger owns whether this is showing, and returns focus to
            itself when it closes.
          </Text>
        </ModalBody>
        <ModalFooter>
          <DoneButton />
        </ModalFooter>
      </Modal>
    </DialogTrigger>
  ),
};

/** A footer button closes the dialog it is in, either way it is driven. */
const DoneButton = () => {
  const close = useDialogClose();
  return (
    <Button variant="primary" onPress={close}>
      Done
    </Button>
  );
};

/**
 * A full-size dialog over a page that scrolls. Opening a modal locks page
 * scroll by reserving the scrollbar gutter; the backdrop and dialog must
 * still reach the right-hand viewport edge — the page is striped yellow, the
 * dialog plain white, so any stripe visible beside the open dialog is the
 * bug — as is a click near the right edge dismissing the dialog or missing
 * the close button (the reserved gutter is a hit-testing dead zone unless
 * released). Scrolling content inside the dialog gets its own scrollbar
 * (the data-log table case).
 */
export const FullOverScrollingPage: Story = {
  args: { size: "full" },
  render: (args) => {
    const [isOpen, setOpen] = useState(false);
    return (
      <>
        {/* The "page": loudly striped, and spanning the viewport with vw
            units so it also paints under the reserved gutter — any sliver
            of stripes beside the open dialog is the bug. */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            width: "100vw",
            height: "100vh",
            zIndex: -1,
            background:
              "repeating-linear-gradient(45deg, #ffd166 0 24px, #fff3cd 24px 48px)",
          }}
        />
        <Button variant="primary" onPress={() => setOpen(true)}>
          Open full-screen dialog
        </Button>
        {/* Tall enough that the page behind has a scrollbar to give up. */}
        <div style={{ height: "300vh" }} />
        <Modal {...args} isOpen={isOpen} onClose={() => setOpen(false)}>
          <ModalCloseButton />
          <ModalHeader>Edge to edge</ModalHeader>
          <ModalBody>
            <Text>
              The page behind has a scrollbar. This dialog spans the full
              viewport width; the rows below scroll inside the dialog.
            </Text>
            <div
              style={{
                overflowY: "auto",
                maxHeight: "50vh",
                marginTop: "1rem",
              }}
            >
              {Array.from({ length: 60 }, (_, i) => (
                <Text key={i}>Row {i + 1}</Text>
              ))}
            </div>
          </ModalBody>
        </Modal>
      </>
    );
  },
};

/** role="alertdialog" for interrupting confirmations. */
export const AlertDialog: Story = {
  render: () => {
    const [isOpen, setOpen] = useState(false);
    return (
      <>
        <Button variant="outline" tone="danger" onPress={() => setOpen(true)}>
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
              <Button
                variant="solid"
                tone="danger"
                onPress={() => setOpen(false)}
              >
                Delete
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </Modal>
      </>
    );
  },
};
