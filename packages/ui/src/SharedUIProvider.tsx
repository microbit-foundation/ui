/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { I18nProvider } from "react-aria-components";
import { IntlContext } from "react-intl";
import { racLocale } from "./rac-locale";

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
  /**
   * Locale for react-aria's own built-in strings. Defaults to the surrounding
   * IntlProvider's locale, which is what apps want: pass this only where the
   * two must differ.
   */
  locale?: string;
  /**
   * Keeps `<html lang>` in step with the locale, so assistive tech announces
   * the page in the app's language. On by default; set false where the app
   * doesn't own the document it's mounted in (an embedded widget), or when
   * mounting more than one provider per page. The static `lang="en"` in
   * index.html remains the pre-hydration default.
   */
  setDocumentLang?: boolean;
  children: ReactNode;
}

/**
 * SharedUIProvider — the app-side installation point for shared-ui
 * integrations: the optional overlay-close registrar, and the locale for
 * react-aria's built-in strings.
 *
 * This package's own strings come from react-intl, so an IntlProvider must be
 * mounted above shared-ui components (see the package README). react-aria
 * translates its built-in strings itself, from its own bundled catalogs, and
 * without this provider it picks the locale from the browser rather than from
 * the app's language setting — mount it inside the IntlProvider so the two
 * agree.
 */
export const SharedUIProvider = ({
  overlayCloseRegistrar,
  locale,
  setDocumentLang = true,
  children,
}: SharedUIProviderProps) => {
  // Read the context rather than calling useIntl(), which throws when there is
  // no IntlProvider: react-aria falls back to the browser locale, as before.
  const intlLocale = useContext(IntlContext)?.locale;
  const appLocale = locale ?? intlLocale;
  useEffect(() => {
    if (setDocumentLang && appLocale) {
      document.documentElement.lang = appLocale;
    }
  }, [setDocumentLang, appLocale]);
  const value = useMemo(
    () => ({ overlayCloseRegistrar }),
    [overlayCloseRegistrar],
  );
  return (
    <SharedUIContext.Provider value={value}>
      <I18nProvider locale={racLocale(appLocale)}>{children}</I18nProvider>
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
