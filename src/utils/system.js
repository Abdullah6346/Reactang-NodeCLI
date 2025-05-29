import { execSync, spawn } from "child_process";
import os from "os";
import chalk from "chalk";
import { log } from "./logger.js";

export function commandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: "ignore" });
    return true;
  } catch {
    try {
      execSync(`where ${command}`, { stdio: "ignore" }); // For Windows
      return true;
    } catch {
      return false;
    }
  }
}

export function isGitAvailable() {
  return commandExists("git");
}

export function executeCommand(command, options = {}) {
  const {
    cwd = process.cwd(),
    errorMessage = "Command failed",
    verbose = true,
  } = options;

  log.step(
    `Executing: ${chalk.cyan(command)}${
      cwd !== process.cwd() ? ` in ${chalk.yellow(cwd)}` : ""
    }`
  );

  try {
    if (verbose) {
      execSync(command, { cwd, stdio: "inherit" });
    } else {
      execSync(command, { cwd, stdio: "pipe" });
    }
    return true;
  } catch (error) {
    log.error(`${errorMessage} (Exit code: ${error.status})`);
    if (error.stderr) {
      console.error(chalk.red(error.stderr.toString()));
    }
    if (error.stdout) {
      console.log(chalk.gray(error.stdout.toString()));
    }
    return false;
  }
}

// This function was defined in your original code but not used.
// Kept here for completeness or future use.
export function executeCommandAsync(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const { cwd = process.cwd() } = options;

    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      shell: os.platform() === "win32",
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on("error", (error) => {
      reject(error);
    });
  });
}
