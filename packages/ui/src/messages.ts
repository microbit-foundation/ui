/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { MessageFormatElement } from "react-intl";
import en from "../lang/ui.en.json";
import caCatalog from "./messages/ui.ca.json";
import enUsCatalog from "./messages/ui.en-us.json";
import enCatalog from "./messages/ui.en.json";
import esEsCatalog from "./messages/ui.es-es.json";
import frCatalog from "./messages/ui.fr.json";
import jaCatalog from "./messages/ui.ja.json";
import koCatalog from "./messages/ui.ko.json";
import lolCatalog from "./messages/ui.lol.json";
import nlCatalog from "./messages/ui.nl.json";
import plCatalog from "./messages/ui.pl.json";
import ptBrCatalog from "./messages/ui.pt-br.json";
import zhTwCatalog from "./messages/ui.zh-tw.json";

/**
 * Descriptor for one of this package's messages. The English text rides along
 * as defaultMessage so components render English without any catalog merging;
 * apps merge `messages` for other locales.
 */
export const uiMessage = (id: keyof typeof en) => ({
  id,
  defaultMessage: en[id].defaultMessage,
});

type Catalog = Record<string, MessageFormatElement[]>;

/**
 * Compiled (formatjs AST) message catalogs by lowercase locale id, for
 * spreading into an app's IntlProvider `messages` alongside the app's own
 * catalog for the active locale. Source of truth is lang/ui.<locale>.json;
 * regenerate with `npm run i18n:compile`.
 */
export const messages = {
  ca: caCatalog,
  en: enCatalog,
  "en-us": enUsCatalog,
  "es-es": esEsCatalog,
  fr: frCatalog,
  ja: jaCatalog,
  ko: koCatalog,
  lol: lolCatalog,
  nl: nlCatalog,
  pl: plCatalog,
  "pt-br": ptBrCatalog,
  "zh-tw": zhTwCatalog,
} as unknown as Record<string, Catalog>;
