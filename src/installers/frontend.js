import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { log } from "../utils/logger.js";
import { commandExists, executeCommand } from "../utils/system.js";
import { EMOJI } from "../utils/constants.js";

export async function installFrontendDependencies(projectPath) {
  console.log(chalk.green.bold("=".repeat(60)));
  console.log(
    chalk.green.bold(
      `${EMOJI.NODE} FRONTEND DEPENDENCY INSTALLATION ${EMOJI.NODE}`
    )
  );
  console.log(chalk.green.bold("=".repeat(60)));

  if (!commandExists("node")) {
    log.error(
      "Node.js ('node') is not installed or not in PATH. Please install Node.js."
    );
    return false;
  }

  const packageJsonFile = path.join(projectPath, "package.json");
  if (!fs.existsSync(packageJsonFile)) {
    log.warning(
      `'package.json' not found in ${projectPath}. Skipping frontend dependencies.`
    );
    return true;
  }

  if (!commandExists("pnpm")) {
    log.info(
      "pnpm not found. Attempting to install pnpm globally using npm..."
    );
    if (!commandExists("npm")) {
      log.error(
        "npm is not installed or not in PATH. Cannot install pnpm. Please install pnpm or npm manually."
      );
      return false;
    }
    if (
      !executeCommand("npm install -g pnpm", {
        errorMessage: "Failed to install pnpm globally.",
      })
    ) {
      return false;
    }
    log.success(
      "pnpm installed globally. You might need to open a new terminal for 'pnpm' to be available."
    );
  }

  log.step("Installing Node.js packages with pnpm...");
  if (
    !executeCommand("pnpm install", {
      cwd: projectPath,
      errorMessage: "Failed to install Node.js dependencies.",
    })
  ) {
    return false;
  }

  log.success("Frontend dependencies installed successfully! 🎊");
  return true;
}
