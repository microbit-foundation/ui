/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { afterEach, expect, it, vi } from "vitest";
import {
  Button,
  DialogTrigger,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalHeader,
} from "../src";

afterEach(cleanup);

const renderModal = (props: Record<string, unknown> = {}) =>
  render(
    <IntlProvider locale="en">
      <Modal isOpen onClose={() => undefined} {...props}>
        <ModalHeader>Title</ModalHeader>
        <ModalBody>Body</ModalBody>
      </Modal>
    </IntlProvider>,
  );

it("puts data attributes on the dialog box", () => {
  renderModal({ "data-testid": "the-dialog", "data-state": "open" });
  const box = screen.getByTestId("the-dialog");
  expect(box.getAttribute("data-state")).toBe("open");
  // The box, not the backdrop: the dialog itself is inside it.
  expect(box.querySelector('[role="dialog"]')).not.toBeNull();
});

it("labels the dialog from the header, at h2 by default", () => {
  // RAC's Dialog supplies level 2 through HeadingContext for the title slot.
  renderModal({ "data-testid": "d" });
  expect(screen.getByRole("heading", { name: "Title" }).tagName).toBe("H2");
  cleanup();

  render(
    <IntlProvider locale="en">
      <Modal isOpen onClose={() => undefined}>
        <ModalHeader level={3}>Title</ModalHeader>
      </Modal>
    </IntlProvider>,
  );
  expect(screen.getByRole("heading", { name: "Title" }).tagName).toBe("H3");
});

// The uncontrolled mode: a DialogTrigger holds the state, so the call site
// holds none.
it("opens from a DialogTrigger and closes from inside, with no app state", async () => {
  render(
    <IntlProvider locale="en">
      <DialogTrigger>
        <Button>Open</Button>
        <Modal aria-label="Settings">
          <ModalBody>Body</ModalBody>
          <ModalCloseButton />
        </Modal>
      </DialogTrigger>
    </IntlProvider>,
  );
  expect(screen.queryByRole("dialog")).toBeNull();

  fireEvent.click(screen.getByRole("button", { name: "Open" }));
  expect(screen.getByRole("dialog")).toBeTruthy();

  fireEvent.click(screen.getByRole("button", { name: /close/i }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  // Focus restoration to the trigger is react-aria's, and doesn't settle
  // under jsdom — it is asserted in a browser, not here.
});

it("a controlled Modal ignores an ambient trigger state", () => {
  const onClose = vi.fn();
  render(
    <IntlProvider locale="en">
      <DialogTrigger>
        <Button>Open</Button>
        <Modal aria-label="Settings" isOpen onClose={onClose}>
          <ModalBody>Body</ModalBody>
          <ModalCloseButton />
        </Modal>
      </DialogTrigger>
    </IntlProvider>,
  );
  // Open despite the trigger never being pressed, and closing calls the prop.
  expect(screen.getByRole("dialog")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: /close/i }));
  expect(onClose).toHaveBeenCalledTimes(1);
});

it("leaves Tab onto an iframe to the browser", () => {
  // jsdom has no sequential focus navigation, so this covers only what the
  // shim does to the keystroke. The Modal stories cover where focus lands,
  // in a browser.
  render(
    <IntlProvider locale="en">
      <Modal isOpen onClose={() => undefined} aria-label="Video">
        <ModalCloseButton />
        <Button>Before</Button>
        <ModalBody>
          <iframe title="the video" src="https://example.com/embed" />
        </ModalBody>
      </Modal>
    </IntlProvider>,
  );
  const dialog = screen.getByRole("dialog");
  const before = screen.getByRole("button", { name: "Before" });
  before.focus();
  // fireEvent returns false when the event's default was prevented.
  expect(fireEvent.keyDown(before, { key: "Tab" })).toBe(true);
  expect(document.activeElement).toBe(before);

  // Wrapping backwards from the first control: focus moves to the guard
  // after the frame, for the browser's Shift+Tab to carry on from.
  const close = screen.getByRole("button", { name: /close/i });
  close.focus();
  expect(fireEvent.keyDown(close, { key: "Tab", shiftKey: true })).toBe(true);
  expect(document.activeElement).toBe(dialog.lastElementChild);
});

it("handles Tab onto an iframe from the dialog itself", () => {
  // Where focus is once a dialog has opened, which is not a tab stop.
  const { unmount } = render(
    <IntlProvider locale="en">
      <Modal isOpen onClose={() => undefined} aria-label="Video">
        <ModalCloseButton />
        <ModalBody>
          <iframe title="the video" src="https://example.com/embed" />
        </ModalBody>
      </Modal>
    </IntlProvider>,
  );
  let dialog = screen.getByRole("dialog");
  expect(document.activeElement).toBe(dialog);
  expect(fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true })).toBe(true);
  expect(document.activeElement).toBe(dialog.lastElementChild);
  unmount();

  render(
    <IntlProvider locale="en">
      <Modal isOpen onClose={() => undefined} aria-label="Video">
        <ModalBody>
          <iframe title="the video" src="https://example.com/embed" />
        </ModalBody>
        <Button>After</Button>
      </Modal>
    </IntlProvider>,
  );
  dialog = screen.getByRole("dialog");
  expect(document.activeElement).toBe(dialog);
  expect(fireEvent.keyDown(dialog, { key: "Tab" })).toBe(true);
  expect(document.activeElement).toBe(dialog);
});

it("wraps Tab out of a frame at the end of the dialog", async () => {
  // Key presses in a frame never reach the page, so guards at the ends of
  // the dialog become tab stops while a frame has focus.
  render(
    <IntlProvider locale="en">
      <Modal isOpen onClose={() => undefined} aria-label="Video">
        <ModalCloseButton />
        <ModalBody>
          <iframe title="the video" src="https://example.com/embed" />
        </ModalBody>
      </Modal>
    </IntlProvider>,
  );
  const dialog = screen.getByRole("dialog");
  const endGuard = dialog.lastElementChild as HTMLElement;
  const close = screen.getByRole("button", { name: /close/i });
  close.focus();
  expect(endGuard.tabIndex).toBe(-1);

  screen.getByTitle("the video").focus();
  await waitFor(() => expect(endGuard.tabIndex).toBe(0));

  // Where the browser's Tab lands on leaving the frame.
  endGuard.focus();
  expect(document.activeElement).toBe(close);
  expect(endGuard.tabIndex).toBe(-1);
});

const renderFrameModal = () => {
  render(
    <IntlProvider locale="en">
      <Modal isOpen onClose={() => undefined} aria-label="Video">
        <ModalCloseButton />
        <ModalBody>
          <iframe title="the video" src="https://example.com/embed" />
        </ModalBody>
      </Modal>
    </IntlProvider>,
  );
  return {
    close: screen.getByRole("button", { name: /close/i }),
    frame: screen.getByTitle("the video"),
    endGuard: screen.getByRole("dialog").lastElementChild as HTMLElement,
  };
};

const twoFrames = () =>
  new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve)),
  );

it("keeps FocusScope from pulling focus back when focus leaves for a frame", async () => {
  // Firefox moving into a cross-process frame, by Tab or by a click: the
  // control loses focus, the window blurs, and the frame is not yet the
  // active element when FocusScope checks a frame later. The shim depends
  // on that check and on the attribute react-aria exempts from it, neither
  // of which is public; renaming the attribute fails this test.
  const { close } = renderFrameModal();
  close.focus();
  close.blur();
  fireEvent.blur(window);
  await twoFrames();
  expect(document.activeElement).toBe(document.body);
  expect(
    document.documentElement.hasAttribute("data-react-aria-top-layer"),
  ).toBe(false);

  // Past the point where the shim would recover dropped focus.
  await new Promise((resolve) => setTimeout(resolve, 150));
  expect(document.activeElement).toBe(document.body);
});

it("recovers focus dropped on the body", async () => {
  // FocusScope's check does this by itself; the shim suspends that check
  // and so repeats it once the window is known not to have blurred.
  const { close } = renderFrameModal();
  close.focus();
  close.blur();
  expect(document.activeElement).toBe(document.body);
  await waitFor(() => expect(document.activeElement).toBe(close));
});

it("arms the guards when a frame becomes the active element late", async () => {
  const { close, frame, endGuard } = renderFrameModal();
  close.focus();
  close.blur();
  fireEvent.blur(window);
  await new Promise((resolve) => setTimeout(resolve, 20));
  expect(endGuard.tabIndex).toBe(-1);

  // No event tells the page that focus has reached the frame.
  const activeElement = vi
    .spyOn(document, "activeElement", "get")
    .mockReturnValue(frame);
  try {
    await waitFor(() => expect(endGuard.tabIndex).toBe(0));
  } finally {
    activeElement.mockRestore();
  }
});
