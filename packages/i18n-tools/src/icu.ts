/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  parse,
  TYPE,
  type MessageFormatElement,
} from "@formatjs/icu-messageformat-parser";

/**
 * Parses with the parser's defaults, as `formatjs compile --ast` does, so the
 * compiled catalogs match what the apps have always loaded.
 */
export const parseMessage = (message: string): MessageFormatElement[] =>
  parse(message);

export interface Signature {
  /** Names of `{argument}`s, including plural and select arguments. */
  arguments: Set<string>;
  /** Names of `<tag>`s. */
  tags: Set<string>;
}

const collect = (elements: MessageFormatElement[], into: Signature): void => {
  for (const element of elements) {
    switch (element.type) {
      case TYPE.argument:
      case TYPE.number:
      case TYPE.date:
      case TYPE.time:
        into.arguments.add(element.value);
        break;
      case TYPE.plural:
      case TYPE.select:
        into.arguments.add(element.value);
        for (const option of Object.values(element.options)) {
          collect(option.value, into);
        }
        break;
      case TYPE.tag:
        into.tags.add(element.value);
        collect(element.children, into);
        break;
      default:
        break;
    }
  }
};

/** The arguments and tags a message uses, whatever its wording. */
export const signature = (message: string): Signature => {
  const result: Signature = { arguments: new Set(), tags: new Set() };
  collect(parseMessage(message), result);
  return result;
};

const setDifference = (a: Set<string>, b: Set<string>): string[] =>
  [...a].filter((x) => !b.has(x)).sort();

/**
 * Explains how a translation's arguments or tags differ from the English
 * message's, or returns undefined when they match. Translators can reorder
 * and reword but must keep every placeholder.
 */
export const describeSignatureDifference = (
  english: string,
  translation: string,
): string | undefined => {
  const en = signature(english);
  const tr = signature(translation);
  const problems: string[] = [];
  const missingArgs = setDifference(en.arguments, tr.arguments);
  const extraArgs = setDifference(tr.arguments, en.arguments);
  const missingTags = setDifference(en.tags, tr.tags);
  const extraTags = setDifference(tr.tags, en.tags);
  if (missingArgs.length) {
    problems.push(`missing {${missingArgs.join("}, {")}}`);
  }
  if (extraArgs.length) {
    problems.push(`unexpected {${extraArgs.join("}, {")}}`);
  }
  if (missingTags.length) {
    problems.push(`missing <${missingTags.join(">, <")}>`);
  }
  if (extraTags.length) {
    problems.push(`unexpected <${extraTags.join(">, <")}>`);
  }
  return problems.length ? problems.join("; ") : undefined;
};

const textOf = (elements: MessageFormatElement[]): string => {
  const parts: string[] = [];
  for (const element of elements) {
    switch (element.type) {
      case TYPE.literal:
        parts.push(element.value);
        break;
      case TYPE.argument:
      case TYPE.number:
      case TYPE.date:
      case TYPE.time:
        // Crowdin counts a placeholder as a word.
        parts.push("placeholder");
        break;
      case TYPE.plural:
      case TYPE.select:
        // Translators translate every branch, so every branch counts.
        for (const option of Object.values(element.options)) {
          parts.push(textOf(option.value));
        }
        break;
      case TYPE.tag:
        parts.push(textOf(element.children));
        break;
      default:
        break;
    }
  }
  return parts.join(" ");
};

/**
 * Word count following Crowdin's approach: whitespace-separated runs that
 * contain a word character, hyphenated words counting once, tags excluded.
 * Used for translation cost estimates.
 */
export const countWords = (message: string): number =>
  textOf(parseMessage(message))
    .split(/\s+/)
    .filter((token) => /\w/.test(token)).length;
