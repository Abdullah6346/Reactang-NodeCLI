import { Command } from "commander";
import path from "path"; // Not strictly needed here anymore, but good to keep if other path ops arise
import { fileURLToPath } from "url"; // Not strictly needed here anymore

// Import project package.json to get version.
// This assumes src/index.js is one level down from package.json
import projectPackageJson from "../package.json" with { type: "json" };
const __version__ = projectPackageJson.version;

import { printBanner } from "./utils/banner.js";
import { handleCreateProject } from "./commands/create.js";
import { log } from "./utils/logger.js";
import { EMOJI } from "./utils/constants.js";

export async function main() {
  printBanner(__version__);

  const program = new Command();

  program
    .name("reactango")
    .description(
      `${EMOJI.ROCKET} ReactTango CLI - Create and manage ReactTango projects.`
    )
    .version(__version__);

  program
    .command("create <project-name>")
    .description("Create a new ReactTango project from the template.")
    .option(
      "--branch <branch>",
      "Specify a branch of the template to clone (e.g., 'main', 'develop')"
    )
    .option("--init-git", "Force initialization of a new git repository")
    .option("--no-init-git", "Force skipping git initialization")
    .option(
      "--install-all",
      "Automatically install all available dependencies (backend & frontend)"
    )
    .option(
      "--skip-all-install",
      "Skip all automatic dependency installations and prompts"
    )
    .option(
      "--no-venv",
      "Don't use a Python virtual environment for backend dependencies"
    )
    .action(async (projectName, options) => {
      try {
        await handleCreateProject(projectName, options);
      } catch (error) {
        log.error(`An unexpected error occurred during project creation: ${error.message}`);
        // For more detailed debugging, you might want to log error.stack
        // if a debug flag is enabled (e.g., process.env.DEBUG)
        if (process.env.DEBUG_REACTANGO_CLI) {
            console.error(error.stack);
        }
        process.exit(1);
      }
    });

  program.parse(process.argv);
}