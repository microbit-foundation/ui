/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { match } from "@formatjs/intl-localematcher";

export interface DefaultLanguageOptions {
  /**
   * Language ids eligible for automatic selection. The app decides this set:
   * typically its supported languages, narrowed to those whose UI translation
   * is complete enough to land a user in without asking (ml-trainer's native
   * builds exclude languages that don't cover the native strings, for
   * example). A language outside this set can still be chosen via the
   * language dialog, which explains its level of support.
   */
  autoSelectableIds: readonly string[];
  /**
   * URL hint, e.g. from a `?l=` parameter (typically the site language passed
   * along when following a link from microbit.org). A first preference rather
   * than an explicit choice, so it gets the same auto-selection treatment as
   * the browser languages.
   */
  languageHint?: string | null;
  /** The user's preferred languages. Defaults to `navigator.languages`. */
  requestedLanguages?: readonly string[];
}

const isValidLanguageId = (langId: string): boolean => {
  try {
    Intl.getCanonicalLocales(langId);
    return true;
  } catch {
    return false;
  }
};

// match() returns its default verbatim when nothing matches so a sentinel
// lets us distinguish no-match from a real match of the default language.
const noMatch = "x-no-match";

/**
 * The initial language for a first run: BCP 47 best-fit matching of the URL
 * hint (first) and the browser/OS language preferences against the ids the
 * app allows to be auto-selected. Falls back to English — the family's
 * source language, which every app ships.
 */
export const getDefaultLanguageId = ({
  autoSelectableIds,
  languageHint = null,
  requestedLanguages = navigator.languages,
}: DefaultLanguageOptions): string => {
  const requested = languageHint
    ? [languageHint, ...requestedLanguages]
    : [...requestedLanguages];
  const matched = match(
    requested.filter(isValidLanguageId),
    [...autoSelectableIds],
    noMatch,
  );
  return matched === noMatch ? "en" : matched;
};
