/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useEffect, useRef } from "react";

/** The value from the previous render (undefined on the first render). */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  // Reading the previous render's value during render is the point of this
  // hook.
  // eslint-disable-next-line react-hooks/refs
  return ref.current;
}
