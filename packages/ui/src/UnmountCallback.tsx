/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useEffect, useRef } from "react";

/**
 * Runs its callback when unmounted. RAC keeps an overlay tree mounted until
 * the exit transition finishes, so mounting this inside the overlay
 * implements Modal/Drawer's `onCloseComplete`. Internal to shared-ui.
 */
export const UnmountCallback = ({ callback }: { callback?: () => void }) => {
  const ref = useRef(callback);
  // Latest-ref pattern: the unmount effect calls the current callback
  // without re-subscribing.
  // eslint-disable-next-line react-hooks/refs
  ref.current = callback;
  useEffect(() => () => ref.current?.(), []);
  return null;
};
