# @microbit/i18n-tools

Translation tooling shared by the micro:bit web apps and the `@microbit/ui`
packages: tidies and compiles [react-intl](https://formatjs.io/) message
catalogs, and moves them to and from [Crowdin](https://crowdin.com/) one file
at a time, without a project build or a zip.

Configured per repo in an `i18n.config.mjs` and driven by the `microbit-i18n`
CLI.

## Commands

| Command                     | What it does                                                                                                                                              |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `microbit-i18n tidy`        | Sorts and prunes every catalog, drops what a translation shouldn't hold (see below) and checks each translation keeps its placeholders. `--check` for CI. |
| `microbit-i18n compile`     | Writes the compiled per-locale catalogs the app loads: formatjs AST, English backfilled, package catalogs merged in.                                      |
| `microbit-i18n download`    | Fetches translations for the configured languages. `--language <id>` for a subset; `--approved-only` to leave out unapproved translations.                |
| `microbit-i18n upload`      | Replaces the English sources in Crowdin after showing what changes. `--keep-translations` for corrections translators need not revisit; `--dry-run`.      |
| `microbit-i18n status`      | Per-language translation and approval progress for this repo's files, configured languages marked.                                                        |
| `microbit-i18n new-strings` | English copy added since a git ref (`--base`, default `main`) with a Crowdin-style word count, for translation cost estimates.                            |

`download`, `upload` and `status` need a Crowdin personal access token in
`CROWDIN_PERSONAL_TOKEN`.

Exit codes: 0 on success, 1 for usage errors, failed downloads or a failing
`--check`, 2 when a translation has placeholder problems (files are still
written so you can fix them in place).

## Configuration

```js
// i18n.config.mjs
import { defineConfig } from "@microbit/i18n-tools";

export default defineConfig({
  crowdin: {
    project: "microbitorg",
    branch: "new",
    directory: "apps/my-app",
  },
  // Crowdin language ids to download. Adding one here is the deliberate step
  // that brings a language into the repo.
  languages: ["ca", "es-ES", "fr", "ja", "pt-BR", "lol"],
  catalogs: [
    {
      source: "lang/ui.en.json",
      out: "src/messages/ui.{lang}.json",
      packages: ["@microbit/ui", "@microbit/ui-patterns"],
      local: ["en-US"],
    },
  ],
});
```

`catalogs` are react-intl catalogs: `{ id: { defaultMessage, description } }`.

- `source` is the English file. `crowdinFile` (default: the source's file
  name) is its name within `crowdin.directory`.
- `translations` is a template for the translated files (default: the source
  path with `.en.json` as `.{lang}.json`). `{lang}` is the lowercased language
  id and `{Lang}` Crowdin's casing.
- `out` is a template for the compiled catalogs. Leave it out for a package
  that ships its `lang/` files for apps to compile.
- `packages` are merged into the compiled output. Their ids must not collide
  with the app's, which the `ui.` prefix guarantees for ours.
- `local` are locales kept by hand rather than in Crowdin.
- `afterDownload` adjusts a language's messages before they are tidied and
  written. It can fetch other Crowdin files for that language, which is how
  CreateAI keeps a block label in step with the MakeCode extension.

`files` are anything else, copied as-is: `{ crowdinFile, local, source? }`. A
`crowdinFile` with a trailing slash is a whole directory.

## What the catalogs hold

The English source keeps its descriptions: they are the translators' context.

A translated file holds only what the language actually has: ids still in the
source, no descriptions, no empty strings. `download` asks Crowdin to skip
untranslated strings and `tidy` prunes the rest, and `compile` backfills from
English. So a diff of `lang/ui.fr.json` shows French changes and nothing else,
and adding an English string touches one file. The `lol` in-context
pseudo-language is the exception: every string is kept, since the in-context
editor keys on them.

A `local` locale's file holds only the messages that differ from English. For
`en-US` that is the handful of spellings, which is also what a review of it
should read.

The compiled `out` files are generated output. Ignore them in git and run
`compile` from `postinstall` and before `start` and `build`, as the apps do
for Panda's `styled-system`.

## Conventions in Crowdin

One project, one branch, one directory per repo. Files are react-intl JSON,
which Crowdin recognises and shows `description` as context. Language ids are
Crowdin's, canonical BCP 47 casing (`pt-BR`); catalog file names are
lowercase.

## Running

The package ships TypeScript and runs on Node 24 or later, which strips types
natively, so there is no build step. Apps add it as a dev dependency and call
`microbit-i18n` from npm scripts.
