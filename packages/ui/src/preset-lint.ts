/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { basePreset } from "./base-preset";

/**
 * Semantic-token key checking for app and brand presets.
 *
 * Panda accepts an unknown `semanticTokens` key without complaint: it
 * typechecks, it generates, and the override never applies — the token keeps
 * the base preset's value with no error at build or at runtime. So a rename
 * in this library silently un-does every downstream override of the old
 * name, and nothing fails until someone looks at the pixels.
 *
 * The guard is to assert that every leaf a preset overrides is one the base
 * preset actually defines. It is not a Panda plugin because the check has to
 * run per consumer — the library cannot see the presets that merge after it.
 */

type Unknown = Record<string, unknown>;

const isObject = (v: unknown): v is Unknown =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * A leaf is an object carrying `value`, which is Panda's token shape. The
 * value itself may be a string or a condition object (`{ base, _onDark }`),
 * so we stop at `value` rather than recursing into it.
 */
const leafEntries = (
  node: unknown,
  prefix: string[] = [],
): [string, unknown][] => {
  if (!isObject(node)) return [];
  if ("value" in node) return [[prefix.join("."), node.value]];
  return Object.entries(node).flatMap(([k, v]) =>
    leafEntries(v, [...prefix, k]),
  );
};

/**
 * `definePreset` results keep `theme.extend.semanticTokens`; hand-written
 * brand presets sometimes use `theme.semanticTokens`. Accept both, and merge
 * rather than picking one, so a preset using both is fully checked.
 */
const semanticEntriesOf = (preset: unknown): [string, unknown][] => {
  if (!isObject(preset)) return [];
  const theme = isObject(preset.theme) ? preset.theme : {};
  const extend = isObject(theme.extend) ? theme.extend : {};
  return [
    ...leafEntries(theme.semanticTokens),
    ...leafEntries(extend.semanticTokens),
  ];
};

const semanticTokensOf = (preset: unknown): string[] =>
  semanticEntriesOf(preset).map(([path]) => path);

export interface SemanticTokenCheckOptions {
  /**
   * Dotted paths this preset deliberately introduces rather than overrides —
   * tokens of its own that the base preset does not define, e.g.
   * `"colors.sidebarHeaderBg"`. Listing one is the statement that it is new;
   * anything unlisted and unknown is treated as a mistake.
   */
  introduces?: string[];
}

/**
 * The semantic-token paths a preset sets that the base preset does not
 * define and that are not declared as new. Empty means the preset's
 * overrides all land.
 *
 * Paths include the token category, e.g. `colors.fg.link`.
 */
export const unknownSemanticTokens = (
  preset: unknown,
  { introduces = [] }: SemanticTokenCheckOptions = {},
): string[] => {
  const known = new Set(semanticTokensOf(basePreset));
  const declared = new Set(introduces);
  return semanticTokensOf(preset)
    .filter((path) => !known.has(path) && !declared.has(path))
    .sort();
};

/**
 * The paths where a preset's override loses a condition the base preset's
 * value carries.
 *
 * Some base-preset tokens hold a condition object rather than a flat value —
 * `{ base, _onDark }`, the dark-surface flips. A token merge replaces the
 * value wholesale, so overriding one of these with a flat value (or a
 * condition object missing a key) silently drops the flip: the same failure
 * mode as an unknown key, one door over. A preset that genuinely wants no
 * flip states it — `{ base: X, _onDark: X }`.
 *
 * Empty means every conditional token the preset touches keeps all of the
 * base preset's condition keys.
 */
export const droppedConditionTokens = (preset: unknown): string[] => {
  const conditional = new Map(
    semanticEntriesOf(basePreset).filter(([, value]) => isObject(value)),
  );
  const dropped = new Set<string>();
  for (const [path, value] of semanticEntriesOf(preset)) {
    const base = conditional.get(path);
    if (!base) continue;
    const keeps = isObject(value) && Object.keys(base).every((k) => k in value);
    if (!keeps) dropped.add(path);
  }
  return [...dropped].sort();
};

/**
 * The paths listed as new that the base preset now defines. Not an error in
 * itself — but it means the library has grown a token of the same name, so
 * the preset is silently overriding it rather than defining its own, and the
 * two probably want reconciling.
 */
export const reservedSemanticTokens = (
  preset: unknown,
  { introduces = [] }: SemanticTokenCheckOptions = {},
): string[] => {
  const known = new Set(semanticTokensOf(basePreset));
  const set = new Set(semanticTokensOf(preset));
  return introduces.filter((path) => known.has(path) && set.has(path)).sort();
};
