/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
// Brand-diff audit for an app migrating from Chakra (see
// docs/migration-playbook.md).
//
// Diffs the *resolved* OSS and private Chakra themes — source text is
// quote-style noise — then, where a Panda preset pair already exists,
// cross-checks that it encodes the same delta, i.e.
// (private-chakra − oss-chakra) == (private-panda − oss-panda) for every
// divergent token. Run it from the app repo; rerun after any theme or preset
// change while Chakra remains.
//
// Both theme entry points are bundled with esbuild (packages external) and
// imported from the app repo, so both resolve the same hoisted
// @chakra-ui/react — mirroring what vite's theme-package alias does at
// runtime and keeping Chakra-version drift out of the diff. Style-config
// functions are evaluated with the same base theme on both sides so token
// *references* (brand.600) stay as strings and ramp-driven divergence
// doesn't leak into the output.
//
// Usage (from the app repo, which must depend on esbuild — vite apps do):
//   node ../ui/bin/diff-chakra-themes.mjs [path-to-private-package]
// Assumes the family layout: OSS theme at src/deployment/default/theme.ts,
// private theme at <private>/src/theme.ts, Panda presets (when present) at
// src/deployment/default/panda-preset.ts and <private>/src/panda-preset.ts.
import { mkdirSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";

const repo = process.cwd();
const privateRepo = path.resolve(
  repo,
  process.argv[2] ?? `../${path.basename(repo)}-microbit`,
);
// Resolve esbuild, preferring the app repo's copy so the bundle matches the
// app's own toolchain version. Fall back to the kit's own esbuild when the
// app's fails to launch — a wrong-platform native binary in the app's
// node_modules (e.g. a macOS-populated tree run on Linux) is an environment
// artifact the differ shouldn't be blocked by, and `packages: "external"`
// keeps @chakra-ui/react resolving through the app regardless of which esbuild
// bundles the theme entry points.
const requireApp = createRequire(path.join(repo, "package.json"));
const requireKit = createRequire(import.meta.url);
async function resolveBuild() {
  let lastErr;
  for (const [req, where] of [
    [requireApp, "app repo"],
    [requireKit, "kit (../ui)"],
  ]) {
    try {
      const esbuild = req("esbuild");
      // Force the native binary to launch now, so a platform mismatch fails
      // over here rather than mid-bundle.
      await esbuild.transform("0");
      if (where !== "app repo") {
        console.warn(
          `note: app repo's esbuild would not launch (${
            lastErr?.message
              ?.split("\n")
              .map((l) => l.trim())
              .find(Boolean) ?? "unknown error"
          }); using ${where}'s esbuild instead.`,
        );
      }
      return esbuild.build;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}
const build = await resolveBuild();

const outDir = path.join(repo, "node_modules/.diff-chakra-themes");
mkdirSync(outDir, { recursive: true });

async function load(entry, name) {
  const outfile = path.join(outDir, `${name}.mjs`);
  await build({
    entryPoints: [entry],
    bundle: true,
    packages: "external",
    format: "esm",
    platform: "node",
    outfile,
    logLevel: "silent",
  });
  const mod = await import(pathToFileURL(outfile));
  return mod.default ?? mod.theme;
}

const ossTheme = await load(
  path.join(repo, "src/deployment/default/theme.ts"),
  "oss-theme",
);
const privTheme = await load(
  path.join(privateRepo, "src/theme.ts"),
  "priv-theme",
);

// Evaluate Chakra style-config functions with the SAME theme on both sides so
// only genuine structural differences surface, not ramp resolution.
const evalCtx = { colorScheme: "gray", colorMode: "light", theme: ossTheme };
const resolve = (v) => {
  if (typeof v !== "function") {
    return v;
  }
  try {
    return v(evalCtx);
  } catch {
    return `[unevaluable function] ${v.toString().slice(0, 60)}`;
  }
};

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

function diff(a, b, prefix, out) {
  a = resolve(a);
  b = resolve(b);
  if (a === b) {
    return;
  }
  if (isObj(a) && isObj(b)) {
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      diff(a[k], b[k], prefix ? `${prefix}.${k}` : k, out);
    }
    return;
  }
  const [ja, jb] = [JSON.stringify(a), JSON.stringify(b)];
  if (ja !== jb) {
    out.push({ path: prefix, oss: ja, priv: jb });
  }
}

const diffs = [];
diff(ossTheme, privTheme, "", diffs);

const tokenDiffs = diffs.filter((d) =>
  /^(colors|fonts|radii|shadows|space|sizes)\./.test(d.path),
);
const componentDiffs = diffs.filter((d) => d.path.startsWith("components."));
const otherDiffs = diffs.filter(
  (d) => !tokenDiffs.includes(d) && !componentDiffs.includes(d),
);

const table = (rows) => {
  const w = Math.max(...rows.map((d) => d.path.length), 4);
  for (const d of rows) {
    console.log(`  ${d.path.padEnd(w)}  ${d.oss ?? "-"}  ->  ${d.priv ?? "-"}`);
  }
};

console.log(`\n== A. Token diffs (${tokenDiffs.length}) ==`);
table(tokenDiffs);
console.log(`\n== B. Component style diffs (${componentDiffs.length}) ==`);
table(componentDiffs);
console.log(`\n== C. Other theme diffs (${otherDiffs.length}) ==`);
table(otherDiffs);

// -- Panda cross-check ------------------------------------------------------
// (private-panda − oss-panda) must equal (private-chakra − oss-chakra).
// Skipped when the app has no Panda preset pair yet (census/pre-work time).
const ossPresetPath = path.join(repo, "src/deployment/default/panda-preset.ts");
const privPresetPath = path.join(privateRepo, "src/panda-preset.ts");
if (!existsSync(ossPresetPath) || !existsSync(privPresetPath)) {
  console.log(
    `\n== D. Panda preset cross-check ==\n  skipped (no preset pair found)`,
  );
  process.exit(0);
}
const ossPreset = await load(ossPresetPath, "oss-preset");
const privPreset = await load(privPresetPath, "priv-preset");

// The family's OSS ramp defaults live in @microbit/ui's base preset, which the
// app/private presets only override token-by-token. Load and merge it so the
// resolved OSS tokens are base ⊕ app, and private is base ⊕ app ⊕ private —
// mirroring how Panda merges the preset stack at codegen. Without this, tokens
// the base preset provides (gray/teal/purple ramps) read as `undefined` here
// and every one false-mismatches. Resolved through the app repo so the version
// matches what the app builds against.
let basePreset;
try {
  const baseEntry = createRequire(path.join(repo, "package.json")).resolve(
    "@microbit/ui/base-preset",
  );
  basePreset = await load(baseEntry, "base-preset");
} catch {
  basePreset = undefined;
}

// A token leaf is a `{ value }` object; anything else with children is a group.
const isLeaf = (v) => isObj(v) && "value" in v;
const deepMerge = (a, b) => {
  if (b === undefined) return a;
  if (a === undefined || isLeaf(a) || isLeaf(b) || !isObj(a) || !isObj(b)) {
    return b;
  }
  const out = { ...a };
  for (const k of Object.keys(b)) {
    out[k] = deepMerge(a[k], b[k]);
  }
  return out;
};
const pandaTokens = (preset) =>
  deepMerge({ ...preset?.theme?.tokens }, { ...preset?.theme?.extend?.tokens });
const unwrap = (node, segs) => {
  for (const s of segs) {
    node = node?.[s];
  }
  // Token leaves are { value } in Panda presets.
  return isObj(node) && "value" in node ? node.value : node;
};

const baseTok = pandaTokens(basePreset);
const ossTok = deepMerge(baseTok, pandaTokens(ossPreset));
const privTok = deepMerge(ossTok, pandaTokens(privPreset));

console.log(`\n== D. Panda preset cross-check ==`);
let mismatches = 0;
for (const d of tokenDiffs) {
  const segs = d.path.split(".");
  const ossPanda = unwrap(ossTok, segs);
  // Presets merge, so a token the private preset doesn't set falls back to OSS.
  const privPanda = unwrap(privTok, segs) ?? ossPanda;
  const ok =
    JSON.stringify(ossPanda) === d.oss && JSON.stringify(privPanda) === d.priv;
  if (!ok) {
    mismatches++;
    console.log(
      `  MISMATCH ${d.path}: chakra ${d.oss} -> ${d.priv}; panda ${JSON.stringify(
        ossPanda,
      )} -> ${JSON.stringify(privPanda)}`,
    );
  }
}
console.log(
  mismatches
    ? `  ${mismatches} mismatches — the Panda presets do NOT encode these deltas`
    : `  all ${tokenDiffs.length} token deltas are reproduced by the Panda preset pair`,
);
