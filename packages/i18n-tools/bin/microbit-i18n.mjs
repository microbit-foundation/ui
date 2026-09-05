#!/usr/bin/env node
// Node 24 runs the TypeScript sources directly (type stripping), so there is
// no build step; see the package README.
import { main } from "../src/cli.ts";

process.exitCode = await main(process.argv.slice(2));
