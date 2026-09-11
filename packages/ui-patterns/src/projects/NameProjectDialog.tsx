/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  TextField,
} from "@microbit/ui";
import {
  FocusEvent,
  FormEvent,
  ReactNode,
  RefObject,
  useCallback,
  useState,
} from "react";
import { FormattedMessage } from "react-intl";
import { uiPatternsMessage } from "../messages";

export interface NameProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  /** The name to start from: the current one, or a default for a new project. */
  initialName: string;
  /** Defaults to "Name your project". */
  heading?: ReactNode;
  /**
   * The verb for what saving does ("Create", "Rename", "Confirm and save").
   * Required: there is always a better label than "Confirm".
   */
  confirmText: ReactNode;
  /** Shown under the field, e.g. what the name is used for. */
  helperText?: ReactNode;
  finalFocusRef?: RefObject<HTMLElement>;
  onCloseComplete?: () => void;
}

export const isValidProjectName = (name: string): boolean =>
  name.trim().length > 0;

/**
 * Asks for a project name. The field starts with the initial name selected
 * so typing replaces it. Submit with Enter or the confirm button; both are
 * disabled while the name is blank.
 */
export const NameProjectDialog = ({
  isOpen,
  onClose,
  onSave,
  initialName,
  heading,
  confirmText,
  helperText,
  finalFocusRef,
  onCloseComplete,
}: NameProjectDialogProps) => {
  const [name, setName] = useState(initialName);
  // Start afresh from the initial name each time the dialog opens. Adjusting
  // state during render, as React recommends for state derived from a prop
  // change, rather than an effect that would flash the stale name.
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setName(initialName);
    }
  }
  const isValid = isValidProjectName(name);

  const handleFocus = useCallback((event: FocusEvent<HTMLInputElement>) => {
    event.target.setSelectionRange(0, event.target.value.length);
  }, []);
  const handleSave = useCallback(() => {
    if (isValid) {
      onSave(name.trim());
    }
  }, [isValid, name, onSave]);
  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      handleSave();
    },
    [handleSave],
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      finalFocusRef={finalFocusRef}
      onCloseComplete={onCloseComplete}
    >
      <ModalHeader>
        {heading ?? (
          <FormattedMessage
            {...uiPatternsMessage("ui-patterns.name-project-heading")}
          />
        )}
      </ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <form onSubmit={handleSubmit}>
          <TextField
            label={
              <FormattedMessage
                {...uiPatternsMessage("ui-patterns.name-label")}
              />
            }
            value={name}
            onChange={setName}
            onFocus={handleFocus}
            autoFocus
            autoComplete="off"
            isRequired
            isInvalid={!isValid}
            helperText={helperText}
            helperTextCss={{ color: "gray.700" }}
            errorMessage={
              <FormattedMessage
                {...uiPatternsMessage("ui-patterns.project-name-not-empty")}
              />
            }
          />
        </form>
      </ModalBody>
      <ModalFooter css={{ gap: 3 }}>
        <Button onPress={onClose}>
          <FormattedMessage
            {...uiPatternsMessage("ui-patterns.cancel-action")}
          />
        </Button>
        <Button variant="primary" onPress={handleSave} isDisabled={!isValid}>
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
