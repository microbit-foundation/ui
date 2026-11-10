/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { expect, screen, waitFor } from "storybook/test";
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

// Stands in for an embedded editor or form. The sandbox gives it an opaque
// origin, so the page can no more reach into it than into a real embed, and
// it reports its own focus so the story can show where Tab landed.
const frameDocument = `<!doctype html>
<html lang="en">
  <body style="font-family: sans-serif">
    <button id="first">First in frame</button>
    <button id="last">Last in frame</button>
    <script>
      const report = () =>
        parent.postMessage(
          { frameFocus: document.hasFocus() ? document.activeElement.id : "" },
          "*",
        );
      for (const type of ["focusin", "focusout", "focus", "blur"]) {
        addEventListener(type, () => setTimeout(report));
      }
    </script>
  </body>
</html>`;

const IframeModal = ({ footer }: { footer: boolean }) => {
  const [isOpen, setOpen] = useState(true);
  const [frameFocus, setFrameFocus] = useState("");
  const frameRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const listener = (e: MessageEvent) => {
      if (e.source === frameRef.current?.contentWindow) {
        setFrameFocus((e.data as { frameFocus: string }).frameFocus);
      }
    };
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);
  return (
    <>
      <Button variant="primary" onPress={() => setOpen(true)}>
        Open modal
      </Button>
      <Modal size="lg" isOpen={isOpen} onClose={() => setOpen(false)}>
        <ModalCloseButton />
        <ModalHeader>Embedded content</ModalHeader>
        <ModalBody>
          <Text>
            Focused in frame:{" "}
            <output data-testid="frame-focus">{frameFocus || "nothing"}</output>
          </Text>
          <Button variant="secondary">Before frame</Button>
          <iframe
            ref={frameRef}
            title="Embedded content"
            sandbox="allow-scripts"
            srcDoc={frameDocument}
            style={{ display: "block", width: "100%", height: "6rem" }}
          />
        </ModalBody>
        {footer && (
          <ModalFooter>
            <Button variant="secondary" onPress={() => setOpen(false)}>
              Done
            </Button>
          </ModalFooter>
        )}
      </Modal>
    </>
  );
};

// storybook/test's key events are simulated: they move focus themselves and
// never reach into a frame. Real key presses exist only under the vitest
// browser runner, so the play functions below do nothing in the Storybook UI.
const realKeyboard = async () =>
  "__vitest_browser__" in globalThis
    ? (await import("vitest/browser")).userEvent
    : undefined;

const tab = "{Tab}";
const shiftTab = "{Shift>}{Tab}{/Shift}";

const expectFrameFocus = (id: string) =>
  waitFor(() =>
    expect(screen.getByTestId("frame-focus")).toHaveTextContent(id),
  );

const expectFocus = (name: string) =>
  waitFor(() => expect(screen.getByRole("button", { name })).toHaveFocus());

// Firefox makes stops of its own on the way into and out of a frame, with
// or without a dialog, so there the stories check only that Tab gets
// through in both directions. Without the shim it doesn't.
const isFirefox = navigator.userAgent.includes("Firefox");

type Keyboard = NonNullable<Awaited<ReturnType<typeof realKeyboard>>>;

const pressUntil = async (
  keyboard: Keyboard,
  key: string,
  expectation: () => Promise<unknown>,
) => {
  for (let presses = 1; ; presses++) {
    await keyboard.keyboard(key);
    try {
      await expectation();
      return;
    } catch (e) {
      if (presses === 4) {
        throw e;
      }
    }
  }
};

const frameFocusIs = (id: string) => () =>
  waitFor(
    () => expect(screen.getByTestId("frame-focus")).toHaveTextContent(id),
    { timeout: 500 },
  );

const focusIsOn = (name: string) => () =>
  waitFor(() => expect(screen.getByRole("button", { name })).toHaveFocus(), {
    timeout: 500,
  });

/**
 * Tab moves between the dialog's controls and those inside an iframe without
 * stopping on the frame itself.
 */
export const WithIframe: Story = {
  render: () => <IframeModal footer />,
  play: async () => {
    const keyboard = await realKeyboard();
    if (!keyboard) {
      return;
    }
    (await screen.findByRole("button", { name: "Before frame" })).focus();
    if (isFirefox) {
      await pressUntil(keyboard, tab, frameFocusIs("first"));
      await pressUntil(keyboard, tab, focusIsOn("Done"));
      await pressUntil(keyboard, shiftTab, frameFocusIs("first"));
      await pressUntil(keyboard, shiftTab, focusIsOn("Before frame"));
      return;
    }
    await keyboard.keyboard(tab);
    await expectFrameFocus("first");
    await keyboard.keyboard(tab);
    await expectFrameFocus("last");
    await keyboard.keyboard(tab);
    await expectFocus("Done");
    await keyboard.keyboard(shiftTab);
    await expectFrameFocus("last");
    await keyboard.keyboard(shiftTab);
    await expectFrameFocus("first");
    await keyboard.keyboard(shiftTab);
    await expectFocus("Before frame");
  },
};

/**
 * The frame as the dialog's last tabbable element, as in a full-screen
 * editor under a toolbar. Shift+Tab from the first control wraps round to
 * the frame, which does take focus itself: the page cannot reach the last
 * control of a cross-origin frame, and the next Shift+Tab gets there.
 */
export const WithIframeLast: Story = {
  render: () => <IframeModal footer={false} />,
  play: async () => {
    const keyboard = await realKeyboard();
    if (!keyboard) {
      return;
    }
    (await screen.findByRole("button", { name: "Close" })).focus();
    await keyboard.keyboard(shiftTab);
    await waitFor(() =>
      expect(screen.getByTitle("Embedded content")).toHaveFocus(),
    );
    if (isFirefox) {
      await pressUntil(keyboard, shiftTab, focusIsOn("Before frame"));
      await pressUntil(keyboard, tab, () =>
        waitFor(
          () =>
            expect(screen.getByTestId("frame-focus")).not.toHaveTextContent(
              "nothing",
            ),
          { timeout: 500 },
        ),
      );
      return;
    }
    await keyboard.keyboard(shiftTab);
    await expectFrameFocus("last");

    screen.getByRole("button", { name: "Before frame" }).focus();
    await keyboard.keyboard(tab);
    await expectFrameFocus("first");
  },
};
