/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
/**
 * Type-level tests: `tsc --noEmit` is what actually runs them, and the
 * `@ts-expect-error` lines fail the build if the error they expect ever stops
 * being reported. The runtime assertion is here so vitest has something to
 * run.
 */
import { expect, it } from "vitest";
import { ControlledModalProps, Modal, ModalBody, ModalProps } from "../src";

/** Controlled: both halves of the pair. */
export const Controlled = () => (
  <Modal isOpen onClose={() => undefined}>
    <ModalBody>Body</ModalBody>
  </Modal>
);

/** Inside a DialogTrigger: neither half. */
export const Uncontrolled = () => (
  <Modal>
    <ModalBody>Body</ModalBody>
  </Modal>
);

/** Half the pair is the mistake the union exists to catch. */
export const Broken = () => (
  // @ts-expect-error `isOpen` without `onClose` leaves nothing to close it.
  <Modal isOpen>
    <ModalBody>Body</ModalBody>
  </Modal>
);

/**
 * A dialog shell that forwards its caller's modal props — the shape three of
 * ml-trainer's dialogs use. `ControlledModalProps`, not `ModalProps`: a
 * spread cannot be matched against a union.
 */
export const Shell = ({
  onClose,
  ...props
}: Omit<ControlledModalProps, "children">) => (
  <Modal onClose={onClose} {...props}>
    <ModalBody>Body</ModalBody>
  </Modal>
);

it("has both prop shapes available", () => {
  const controlled: ModalProps = {
    isOpen: true,
    onClose: () => undefined,
    children: null,
  };
  const uncontrolled: ModalProps = { children: null };
  expect([controlled.isOpen, uncontrolled.isOpen]).toEqual([true, undefined]);
});
