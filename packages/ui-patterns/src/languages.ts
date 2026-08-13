/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

export interface LanguageInfo {
  /** Canonical BCP 47 tag; also the family's Crowdin language code. */
  id: string;
  /** The language's name in itself (endonym). */
  name: string;
  /** The language's name in English. */
  enName: string;
}

/**
 * The family name-book: every language any micro:bit app lists, in the
 * dialog's display order (English first, then by English name). Broader than
 * this package's own catalogs — apps list languages (e.g. MakeCode-only
 * ones) that have no UI translation anywhere.
 *
 * `en` is plain "English" until the en/en-US naming is unified; ml-trainer,
 * which offers both, overrides it to "English (UK)" via the view model's
 * `name` field.
 */
export const languages = [
  { id: "en", name: "English", enName: "English" },
  { id: "ar", name: "العربية", enName: "Arabic" },
  { id: "bg", name: "български", enName: "Bulgarian" },
  { id: "ca", name: "Català", enName: "Catalan" },
  { id: "zh-CN", name: "简体中文", enName: "Chinese (Simplified)" },
  { id: "zh-TW", name: "繁體中文", enName: "Chinese (Traditional)" },
  { id: "cs", name: "Čeština", enName: "Czech" },
  { id: "da", name: "Dansk", enName: "Danish" },
  { id: "nl", name: "Nederlands", enName: "Dutch" },
  { id: "en-US", name: "English (US)", enName: "English (US)" },
  { id: "fi", name: "Suomi", enName: "Finnish" },
  { id: "fr", name: "Français", enName: "French" },
  { id: "de", name: "Deutsch", enName: "German" },
  { id: "el", name: "Ελληνικά", enName: "Greek" },
  { id: "gn", name: "Avañe'ẽ", enName: "Guarani" },
  { id: "he", name: "עברית", enName: "Hebrew" },
  { id: "hu", name: "Magyar", enName: "Hungarian" },
  { id: "is", name: "Íslenska", enName: "Icelandic" },
  { id: "ga-IE", name: "Gaeilge", enName: "Irish" },
  { id: "it", name: "Italiano", enName: "Italian" },
  { id: "ja", name: "日本語", enName: "Japanese" },
  { id: "ko", name: "한국어", enName: "Korean" },
  { id: "lo", name: "ພາສາລາວ", enName: "Lao" },
  { id: "nb", name: "Norsk bokmål", enName: "Norwegian Bokmal" },
  { id: "nn-NO", name: "Norsk nynorsk", enName: "Norwegian Nynorsk" },
  { id: "pl", name: "Polski", enName: "Polish" },
  { id: "pt-BR", name: "Português (Brasil)", enName: "Portuguese (Brazil)" },
  { id: "pt-PT", name: "Português (Portugal)", enName: "Portuguese (Portugal)" },
  { id: "ru", name: "Русский", enName: "Russian" },
  { id: "sr", name: "Srpski", enName: "Serbian (Latin)" },
  { id: "si-LK", name: "සිංහල", enName: "Sinhala" },
  { id: "sk", name: "Slovenčina", enName: "Slovak" },
  { id: "es-ES", name: "Español", enName: "Spanish" },
  { id: "sv-SE", name: "Svenska", enName: "Swedish" },
  { id: "tr", name: "Türkçe", enName: "Turkish" },
  { id: "uk", name: "Українська", enName: "Ukrainian" },
  { id: "vi", name: "Tiếng việt", enName: "Vietnamese" },
  { id: "cy", name: "Cymraeg", enName: "Welsh" },
] as const satisfies readonly LanguageInfo[];

export type KnownLanguageId = (typeof languages)[number]["id"];

const byId = new Map<string, LanguageInfo>(languages.map((l) => [l.id, l]));
const orderById = new Map<string, number>(languages.map((l, i) => [l.id, i]));

export const languageFromId = (id: KnownLanguageId): LanguageInfo =>
  // The Map lookup cannot miss: KnownLanguageId is derived from the entries.
  byId.get(id) as LanguageInfo;

/** Sort key giving the registry's display order. */
export const languageOrder = (id: string): number =>
  orderById.get(id) ?? languages.length;
