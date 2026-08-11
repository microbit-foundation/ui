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
