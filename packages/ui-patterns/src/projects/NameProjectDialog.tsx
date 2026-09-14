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
  useRef,
  useState,
} from "react";
import { FormattedMessage } from "react-intl";
import { uiMessage } from "@microbit/ui/messages";
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
  // The error only shows once the user has edited the name: an empty initial
  // name should not open the dialog in an error state.
  const [isEdited, setIsEdited] = useState(false);
  // Select the whole name on the first focus after opening, so typing
  // replaces it, but not on later focuses, which would override a click's
  // caret position.
  const hasSelectedRef = useRef(false);
  // Start afresh from the initial name each time the dialog opens. Adjusting
  // state during render, as React recommends for state derived from a prop
  // change, rather than an effect that would flash the stale name.
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setName(initialName);
      setIsEdited(false);
      hasSelectedRef.current = false;
    }
  }
  const isValid = isValidProjectName(name);

  const handleChange = useCallback((value: string) => {
    setName(value);
    setIsEdited(true);
  }, []);
  const handleFocus = useCallback((event: FocusEvent<HTMLInputElement>) => {
    if (!hasSelectedRef.current) {
      hasSelectedRef.current = true;
      event.target.setSelectionRange(0, event.target.value.length);
    }
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
            onChange={handleChange}
            onFocus={handleFocus}
            autoFocus
            autoComplete="off"
            isRequired
            isInvalid={isEdited && !isValid}
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
          <FormattedMessage {...uiMessage("ui.cancel-action")} />
        </Button>
        <Button variant="primary" onPress={handleSave} isDisabled={!isValid}>
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
