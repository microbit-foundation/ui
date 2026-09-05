/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { compileCatalog } from "../compile.ts";
import type { ResolvedConfig } from "../config.ts";

export const runCompile = (config: ResolvedConfig): number => {
  let count = 0;
  const warnings = new Set<string>();
  for (const catalog of config.catalogs) {
    const result = compileCatalog(config, catalog);
    count += result.written.length;
    for (const warning of result.warnings) {
      warnings.add(warning);
    }
  }
  for (const warning of warnings) {
    console.warn(`warning: ${warning}`);
  }
  if (count === 0) {
    console.log("No catalogs have an `out` path; nothing to compile.");
  } else {
    console.log(`compiled ${count} catalogs`);
  }
  return 0;
};
