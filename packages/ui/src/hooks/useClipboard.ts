/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Copy a value to the clipboard with a transient `hasCopied` flag for
 * "Copied!" feedback.
 */
export function useClipboard(
  value: string,
  timeoutMs = 1500,
): { onCopy: () => void; hasCopied: boolean } {
  const [hasCopied, setHasCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const markCopied = useCallback(() => {
    setHasCopied(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setHasCopied(false), timeoutMs);
  }, [timeoutMs]);
  const onCopy = useCallback(() => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(value)
        .then(markCopied, () => execCommandCopy(value) && markCopied());
    } else if (execCommandCopy(value)) {
      markCopied();
    }
  }, [value, markCopied]);
  useEffect(() => () => clearTimeout(timeoutRef.current), []);
  return { onCopy, hasCopied };
}

/**
 * execCommand-based fallback copy. Works on a user gesture in contexts the
 * async API refuses: insecure (non-localhost http) origins, where
 * `navigator.clipboard` is undefined, and frames without a clipboard-write
 * permissions policy, where `writeText` rejects.
 */
function execCommandCopy(value: string): boolean {
  const active = document.activeElement;
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    // Unsupported (execCommand is deprecated but universally kept for copy);
    // report failure so the caller shows no false "Copied!".
  }
  textarea.remove();
  if (active instanceof HTMLElement) {
    active.focus();
  }
  return copied;
}
