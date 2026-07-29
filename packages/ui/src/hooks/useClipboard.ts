/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Copy a value to the clipboard with a transient `hasCopied` flag for
 * "Copied!" feedback. Replaces Chakra's `useClipboard`.
 */
export function useClipboard(
  value: string,
  timeoutMs = 1500,
): { onCopy: () => void; hasCopied: boolean } {
  const [hasCopied, setHasCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const onCopy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      setHasCopied(true);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setHasCopied(false), timeoutMs);
    });
  }, [value, timeoutMs]);
  useEffect(() => () => clearTimeout(timeoutRef.current), []);
  return { onCopy, hasCopied };
}
