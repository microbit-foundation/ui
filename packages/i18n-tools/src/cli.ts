/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { parseArgs } from "node:util";
import { runCompile } from "./commands/compile.ts";
import { runDownload } from "./commands/download.ts";
import { runNewStrings } from "./commands/new-strings.ts";
import { runStatus } from "./commands/status.ts";
import { runTidy } from "./commands/tidy.ts";
import { runUpload } from "./commands/upload.ts";
import { ConfigError, loadConfig } from "./config.ts";
import { describeError, tokenEnvVar } from "./crowdin.ts";

const usage = `Usage: microbit-i18n <command> [options]

Commands:
  tidy          Sort and prune the catalogs; check translations keep their placeholders
                  --check           fail if any catalog would change, writing nothing
  compile       Write the compiled per-locale catalogs the app loads
  download      Fetch translations from Crowdin into the repo
                  --language <id>   only this language (repeatable)
                  --approved-only   only approved translations
  upload        Replace the English sources in Crowdin
                  --keep-translations   keep translations of changed strings
                  --dry-run             show the changes without uploading
                  --only <source>       only this source file (repeatable)
  status        Show per-language progress for this repo's files in Crowdin
  new-strings   List English copy added since a git ref, with a word count
                  --base <ref>      compare against this ref (default: main)

Options:
  --config <file>   config file (default: i18n.config.mjs in the current directory)

Crowdin commands read a personal access token from ${tokenEnvVar}.
`;

// The flags each command accepts; parseArgs itself takes any flag anywhere.
const commandOptions: Record<string, string[]> = {
  tidy: ["check"],
  compile: [],
  download: ["language", "approved-only"],
  upload: ["keep-translations", "dry-run", "only"],
  status: [],
  "new-strings": ["base"],
};

export const main = async (argv: string[]): Promise<number> => {
  let parsed: ReturnType<typeof parseArgs>;
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        config: { type: "string" },
        check: { type: "boolean" },
        language: { type: "string", multiple: true },
        "approved-only": { type: "boolean" },
        "keep-translations": { type: "boolean" },
        "dry-run": { type: "boolean" },
        only: { type: "string", multiple: true },
        base: { type: "string" },
        help: { type: "boolean", short: "h" },
      },
    });
  } catch (e) {
    console.error((e as Error).message);
    console.error(usage);
    return 1;
  }
  const { values, positionals } = parsed;
  const command = positionals[0];
  if (values.help || !command) {
    console.log(usage);
    return command ? 0 : 1;
  }
  const allowed = commandOptions[command];
  if (!allowed) {
    console.error(`Unknown command: ${command}\n`);
    console.error(usage);
    return 1;
  }
  const stray = Object.keys(values).filter(
    (name) => name !== "config" && !allowed.includes(name),
  );
  if (stray.length) {
    console.error(`--${stray[0]} is not an option of ${command}\n`);
    console.error(usage);
    return 1;
  }
  try {
    const config = await loadConfig(
      process.cwd(),
      values.config as string | undefined,
    );
    switch (command) {
      case "tidy":
        return runTidy(config, { check: values.check as boolean | undefined });
      case "compile":
        return runCompile(config);
      case "download":
        return await runDownload(config, {
          languages: values.language as string[] | undefined,
          approvedOnly: values["approved-only"] as boolean | undefined,
        });
      case "upload":
        return await runUpload(config, {
          keepTranslations: values["keep-translations"] as boolean | undefined,
          dryRun: values["dry-run"] as boolean | undefined,
          only: values.only as string[] | undefined,
        });
      case "status":
        return await runStatus(config);
      case "new-strings":
        return runNewStrings(config, {
          base: values.base as string | undefined,
        });
      default:
        throw new Error(`Unhandled command ${command}`);
    }
  } catch (e) {
    if (e instanceof ConfigError) {
      console.error(e.message);
    } else {
      console.error(describeError(e));
    }
    return 1;
  }
};
