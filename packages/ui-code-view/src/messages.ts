/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
// A self-reference rather than "../lang/ui.en.json": this package is compiled
// with rootDir src, and the import is left for the app's bundler to resolve
// through the "./lang/*" export.
import en from "@microbit/ui-code-view/lang/ui.en.json";

/**
 * Descriptor for one of this package's messages. The English text rides along
 * as defaultMessage so components render English without any catalog merging;
 * for other locales apps compile lang/ui.<locale>.json into their per-locale
 * catalogs (see README).
 */
export const codeViewMessage = (id: keyof typeof en) => ({
  id,
  defaultMessage: en[id].defaultMessage,
});
