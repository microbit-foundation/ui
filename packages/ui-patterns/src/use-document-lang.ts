/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useEffect } from "react";

/**
 * Keeps `<html lang>` in step with the app's language setting, so assistive
 * tech announces the page in the right language.
 *
 * Deliberately an explicit opt-in rather than something SharedUIProvider does
 * silently: mutating the host document is only correct when the app owns it,
 * and some deployments mount into documents they don't fully own (e.g.
 * data.microbit.org inside the firmware-generated MY_DATA.HTM). Call it once
 * per entry point, beside the app's TranslationProvider. The static
 * `lang="en"` in index.html remains the pre-hydration default.
 */
export const useDocumentLang = (languageId: string): void => {
  useEffect(() => {
    document.documentElement.lang = languageId;
  }, [languageId]);
};
