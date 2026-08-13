/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import en from "../lang/ui.en.json";

/**
 * Descriptor for one of this package's messages. The English text rides along
 * as defaultMessage so components render English without any catalog merging;
 * for other locales apps compile lang/ui.<locale>.json into their per-locale
 * catalogs, exactly as they do for @microbit/ui's catalogs (see README).
 */
export const uiPatternsMessage = (id: keyof typeof en) => ({
  id,
  defaultMessage: en[id].defaultMessage,
});
