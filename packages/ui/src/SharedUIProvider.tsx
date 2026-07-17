/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createContext, ReactNode, useContext, useMemo } from "react";

/**
 * Registers the close function of the currently open dismissable overlay, or
 * clears it (null) when the overlay closes. Installed by apps that need to
 * dismiss overlays from outside the component tree — e.g. the Android
 * hardware back button. Only one overlay is open at a time.
 */
export type OverlayCloseRegistrar = (close: (() => void) | null) => void;

interface SharedUIContextValue {
  overlayCloseRegistrar?: OverlayCloseRegistrar;
}

const SharedUIContext = createContext<SharedUIContextValue | null>(null);

export interface SharedUIProviderProps {
  overlayCloseRegistrar?: OverlayCloseRegistrar;
  children: ReactNode;
}

/**
 * SharedUIProvider — the app-side installation point for optional shared-ui
 * integrations. Currently that is only the overlay-close registrar, so apps
 * without one can omit the provider entirely. Localized strings come from
 * react-intl: an IntlProvider must be mounted above shared-ui components
 * (see the package README for merging this package's message catalogs).
 */
export const SharedUIProvider = ({
  overlayCloseRegistrar,
  children,
}: SharedUIProviderProps) => {
  const value = useMemo(
    () => ({ overlayCloseRegistrar }),
    [overlayCloseRegistrar],
  );
  return (
    <SharedUIContext.Provider value={value}>
      {children}
    </SharedUIContext.Provider>
  );
};

/**
 * The app-installed overlay-close registrar, if any. Overlay components run
 * controlled and register their close function while open so the app can
 * dismiss them; without a registrar they manage open state internally.
 */
export const useOverlayCloseRegistrar = (): OverlayCloseRegistrar | undefined =>
  useContext(SharedUIContext)?.overlayCloseRegistrar;
