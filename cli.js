#!/usr/bin/env node

import { main } from "./src/index.js";
import { fileURLToPath } from "url";
import path from "path";

const currentScriptPath = fileURLToPath(import.meta.url);
// process.argv[1] is the path to the script being executed.
const scriptBeingRun = process.argv[1];

// This check ensures that main() is called only when this script is run directly.
if (path.resolve(currentScriptPath) === path.resolve(scriptBeingRun)) {
  main().catch((error) => {
    // For errors unhandled by main's try-catch, or errors in main itself.
    console.error(`❌ Fatal CLI Error: ${error.message}`);
    // Optionally, provide more debug info if an environment variable is set
    if (process.env.DEBUG_REACTANGO_CLI) {
      console.error(error.stack);
    }
    process.exit(1);
  });
}
