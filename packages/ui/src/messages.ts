/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import en from "../lang/ui.en.json";

/**
 * Descriptor for one of this package's messages. The English text rides along
 * as defaultMessage so components render English without any catalog merging;
 * apps merge `messages` for other locales.
 */
export const uiMessage = (id: keyof typeof en) => ({
  id,
  defaultMessage: en[id].defaultMessage,
});

const compile = (
  catalog: Record<string, { defaultMessage: string }>,
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(catalog).map(([id, message]) => [
      id,
      message.defaultMessage,
    ]),
  );

/**
 * Message catalogs by locale, for spreading into an app's IntlProvider
 * `messages` alongside the app's own catalog for the active locale.
 */
export const messages: Record<string, Record<string, string>> = {
  en: compile(en),
};
