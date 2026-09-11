/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ReactNode, RefObject } from "react";
import { FormattedMessage } from "react-intl";
import { Button } from "./Button";
import { uiMessage } from "./messages";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "./Modal";

export interface ConfirmDialogProps {
  isOpen: boolean;
  heading: ReactNode;
  body: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  /**
   * The verb for what confirming does ("Delete", "Reset"). Required: there
   * is always a better label than "Confirm".
   */
  confirmText: ReactNode;
  /** Defaults to "Cancel". */
  cancelText?: ReactNode;
  finalFocusRef?: RefObject<HTMLElement>;
  onCloseComplete?: () => void;
}

/**
 * An alert dialog for a destructive action. Cancel takes initial focus, as
 * the least destructive choice, and confirm is styled as dangerous.
 */
export const ConfirmDialog = ({
  isOpen,
  heading,
  body,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  finalFocusRef,
  onCloseComplete,
}: ConfirmDialogProps) => (
  <Modal
    isOpen={isOpen}
    onClose={onCancel}
    role="alertdialog"
    size="md"
    isCentered
    finalFocusRef={finalFocusRef}
    onCloseComplete={onCloseComplete}
  >
    <ModalHeader css={{ fontWeight: "bold", lineHeight: 1.2 }}>
      {heading}
    </ModalHeader>
    <ModalBody>{body}</ModalBody>
    <ModalFooter css={{ gap: 3 }}>
      <Button autoFocus onPress={onCancel}>
        {cancelText ?? <FormattedMessage {...uiMessage("ui.cancel-action")} />}
      </Button>
      <Button variant="solid" tone="danger" onPress={onConfirm}>
        {confirmText}
      </Button>
    </ModalFooter>
  </Modal>
);
