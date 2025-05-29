import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import os from "os";
import { log } from "../utils/logger.js";
import { commandExists, executeCommand } from "../utils/system.js";
import { EMOJI } from "../utils/constants.js";

export async function installBackendDependencies(projectPath, useVenv) {
  console.log(chalk.magenta.bold("=".repeat(60)));
  console.log(
    chalk.magenta.bold(
      `${EMOJI.PYTHON} BACKEND DEPENDENCY INSTALLATION ${EMOJI.PYTHON}`
    )
  );
  console.log(chalk.magenta.bold("=".repeat(60)));

  if (!commandExists("python3") && !commandExists("python")) {
    log.error(
      "Python is not installed or not in PATH. Please install Python 3."
    );
    return false;
  }

  const pythonCmd = commandExists("python3") ? "python3" : "python";
  const pipCmd = commandExists("pip3") ? "pip3" : "pip";

  if (!commandExists(pipCmd)) {
    log.error(
      `pip ('${pipCmd}') is not installed or not in PATH. Please install pip.`
    );
    return false;
  }

  const requirementsFile = path.join(projectPath, "requirements.txt");
  if (!fs.existsSync(requirementsFile)) {
    log.warning(
      `'requirements.txt' not found in ${projectPath}. Skipping backend dependencies.`
    );
    return true;
  }

  let pipToUse = pipCmd;

  if (useVenv) {
    const venvPath = path.join(projectPath, "venv");
    log.step(
      `Creating Python virtual environment at '${chalk.yellow(venvPath)}'...`
    );

    if (
      !executeCommand(`${pythonCmd} -m venv venv`, {
        cwd: projectPath,
        errorMessage: "Failed to create virtual environment.",
      })
    ) {
      return false;
    }

    const isWindows = os.platform() === "win32";
    // Correctly form the path to pip within the venv
    const pipExecutableName = isWindows ? `${pipCmd}.exe` : pipCmd;
    pipToUse = path.join(
      venvPath,
      isWindows ? "Scripts" : "bin",
      pipExecutableName
    );

    const activateCommand = isWindows
      ? ".\\venv\\Scripts\\activate"
      : "source venv/bin/activate";

    log.info(
      `Virtual environment created. To activate it later: ${chalk.cyan(
        activateCommand
      )}`
    );
  } else {
    log.info("Not using a virtual environment for Python dependencies.");
  }

  log.step(
    `Installing Python packages from '${chalk.yellow(
      "requirements.txt"
    )}' using '${chalk.cyan(pipToUse)}'...`
  );

  // Ensure pipToUse is quoted if it contains spaces (especially on Windows from venv path)
  const installCommand = `"${pipToUse}" install -r requirements.txt`;
  if (
    !executeCommand(installCommand, {
      cwd: projectPath,
      errorMessage: "Failed to install Python dependencies.",
    })
  ) {
    return false;
  }

  log.success("Backend dependencies installed successfully! 🎊");
  return true;
}
