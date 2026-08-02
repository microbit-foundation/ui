/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { cleanup, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { afterEach, expect, it } from "vitest";
import { Modal, ModalBody, ModalHeader } from "../src";

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

it("puts data attributes on the dialog box, as Chakra's ModalContent did", () => {
  renderModal({ "data-testid": "the-dialog", "data-state": "open" });
  const box = screen.getByTestId("the-dialog");
  expect(box.getAttribute("data-state")).toBe("open");
  // The box, not the backdrop: the dialog itself is inside it.
  expect(box.querySelector('[role="dialog"]')).not.toBeNull();
});

it("labels the dialog from the header, at h2 by default", () => {
  // RAC's Dialog supplies level 2 through HeadingContext for the title slot,
  // so this matches Chakra call sites that put an <h2> in the header.
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
