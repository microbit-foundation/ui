/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useLayoutEffect } from "react";

/**
 * The horizontal insets content must stay clear of, in CSS pixels.
 */
export interface SafeAreaNavInsets {
  left: number;
  right: number;
}

/**
 * A source for the `--safe-area-nav-left`/`--safe-area-nav-right` variables
 * (see the README's CSS-variable contract): a native shell with real inset
 * metadata (e.g. Android's WindowInsets API via a Capacitor plugin), which
 * can tell the navigation bar from a display cutout. Called with a callback
 * to invoke with the current insets immediately and again on every change;
 * returns an unsubscribe function. Keep the source's identity stable — a
 * new function each render resubscribes.
 */
export type SafeAreaNavSource = (
  onChange: (insets: SafeAreaNavInsets) => void,
) => () => void;

/**
 * Keeps `--safe-area-nav-left`/`--safe-area-nav-right` on the document
 * element in step with `source`; without one the variables stay unset and
 * consumers fall back to the raw env() insets. Installed by
 * SharedUIProvider; not exported from the package.
 */
export const useSafeAreaNav = (source?: SafeAreaNavSource) => {
  useLayoutEffect(() => {
    if (!source) {
      return;
    }
    const root = document.documentElement;
    const unsubscribe = source(({ left, right }) => {
      root.style.setProperty("--safe-area-nav-left", `${left}px`);
      root.style.setProperty("--safe-area-nav-right", `${right}px`);
    });
    return () => {
      unsubscribe();
      root.style.removeProperty("--safe-area-nav-left");
      root.style.removeProperty("--safe-area-nav-right");
    };
  }, [source]);
};
