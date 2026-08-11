/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useCallback, useMemo, useState } from "react";

export interface Disclosure {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
}

/**
 * useDisclosure — the open/closed state of a dialog, menu or drawer, and the
 * three functions that change it.
 *
 * A thin `useState` wrapper; the stable object means a disclosure can be
 * passed to a memoised child without re-rendering it.
 */
export const useDisclosure = (defaultIsOpen = false): Disclosure => {
  const [isOpen, setIsOpen] = useState(defaultIsOpen);
  const onOpen = useCallback(() => setIsOpen(true), []);
  const onClose = useCallback(() => setIsOpen(false), []);
  const onToggle = useCallback(() => setIsOpen((open) => !open), []);
  return useMemo(
    () => ({ isOpen, onOpen, onClose, onToggle }),
    [isOpen, onOpen, onClose, onToggle],
  );
};
