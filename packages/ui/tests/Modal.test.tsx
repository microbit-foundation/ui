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
