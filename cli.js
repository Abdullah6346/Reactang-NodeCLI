#!/usr/bin/env node

import { Command } from "commander";
import inquirer from "inquirer"; 
import chalk from "chalk"; 
import ora from "ora"; 
import { execSync, spawn } from "child_process";
import fs from "fs-extra";
import path from "path";
import os from "os";
import { fileURLToPath } from "url"; 


import projectPackageJson from "./package.json" with { type: "json" };
const __version__ = projectPackageJson.version;



const EMOJI = {
  ERROR: "❌",
  WARNING: "⚠️",
  SUCCESS: "✅",
  INFO: "ℹ️",
  CLONE: "🌀",
  TRASH: "🗑️",
  GIT: "🐙",
  ROCKET: "🚀",
  PARTY: "🎉",
  SPARKLES: "✨",
  PROMPT: "❓",
  CANCEL: "🛑",
  SKIP: "🚫",
  NEXT_STEPS: "👉",
  GEAR: "⚙️",
  ADD: "➕",
  COMMIT: "📝",
  PYTHON: "🐍",
  NODE: "🟩",
  INSTALL: "📦",
  NONE: "🔒",
  ALL: "🎯",
};

const TEMPLATE_REPO_URL =
  "https://github.com/Abdullah6346/ReactTangoTemplate.git";

const log = {
  error: (message) => console.log(chalk.red.bold(`${EMOJI.ERROR} ${message}`)),
  warning: (message) =>
    console.log(chalk.yellow.bold(`${EMOJI.WARNING} ${message}`)),
  success: (message) =>
    console.log(chalk.green.bold(`${EMOJI.SUCCESS} ${message}`)),
  info: (message) => console.log(chalk.cyan.bold(`${EMOJI.INFO} ${message}`)),
  step: (message) => console.log(chalk.blue.bold(`${EMOJI.GEAR} ${message}`)),
  party: (message) =>
    console.log(chalk.magenta.bold(`${EMOJI.PARTY} ${message}`)),
  rocket: (message) =>
    console.log(chalk.green.bold(`${EMOJI.ROCKET} ${message}`)),
};

function commandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: "ignore" });
    return true;
  } catch {
    try {
      execSync(`where ${command}`, { stdio: "ignore" }); 
      return true;
    } catch {
      return false;
    }
  }
}

function isGitAvailable() {
  return commandExists("git");
}

function executeCommand(command, options = {}) {
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

function executeCommandAsync(command, args, options = {}) {
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

async function installBackendDependencies(projectPath, useVenv) {
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
    pipToUse = isWindows
      ? path.join(venvPath, "Scripts", `${pipCmd}.exe`)
      : path.join(venvPath, "bin", pipCmd);



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

async function installFrontendDependencies(projectPath) {
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

async function runProjectSetup(
  projectPath,
  installBe,
  installFe,
  useVenvForBe
) {
  console.log(chalk.cyan.bold("=".repeat(70)));
  console.log(
    chalk.cyan.bold(
      `${EMOJI.INSTALL} STARTING DEPENDENCY INSTALLATIONS ${EMOJI.INSTALL}`
    )
  );
  console.log(chalk.cyan.bold("=".repeat(70)));

  let allSuccessful = true;
  let installationsRun = 0;

  if (installBe) {
    installationsRun += 1;
    log.info(
      `[${installationsRun}] Starting backend dependency installation...`
    );
    try {
      if (!(await installBackendDependencies(projectPath, useVenvForBe))) {
        allSuccessful = false;
        log.error("Backend dependency installation failed.");
      } else {
        log.success("Backend installation completed successfully!");
      }
    } catch (error) {
      allSuccessful = false;
      log.error(`Backend dependency installation failed: ${error.message}`);
    }
  }

  if (installFe) {
    installationsRun += 1;
    log.info(
      `[${installationsRun}] Starting frontend dependency installation...`
    );
    try {
      if (!(await installFrontendDependencies(projectPath))) {
        allSuccessful = false;
        log.error("Frontend dependency installation failed.");
      } else {
        log.success("Frontend installation completed successfully!");
      }
    } catch (error) {
      allSuccessful = false;
      log.error(`Frontend dependency installation failed: ${error.message}`);
    }
  }

  if (allSuccessful && (installBe || installFe)) {
    console.log(chalk.green.bold("=".repeat(70)));
    log.party(
      `ALL DEPENDENCY INSTALLATIONS COMPLETED SUCCESSFULLY! ${EMOJI.SPARKLES}`
    );
    console.log(chalk.green.bold("=".repeat(70)));
  } else if (!allSuccessful) {
    console.log(chalk.yellow.bold("=".repeat(70)));
    log.warning(
      "Dependency installation completed with some issues. Please review the logs above."
    );
    console.log(chalk.yellow.bold("=".repeat(70)));
  }

  return allSuccessful;
}

async function handleCreateProject(projectName, options) {
  const targetDir = path.resolve(projectName);

  if (fs.existsSync(targetDir)) {
    log.error(
      `Directory '${targetDir}' already exists. Please choose a different name or remove the existing directory.`
    );
    process.exit(1);
  }

  const spinner = ora(
    `${EMOJI.CLONE} Cloning ReactTangoTemplate into '${chalk.yellow(
      projectName
    )}'...`
  ).start();

  try {
    let gitCloneCommand = `git clone`;
    if (options.branch) {
      gitCloneCommand += ` --branch ${options.branch}`;
    }
    gitCloneCommand += ` ${TEMPLATE_REPO_URL} "${targetDir}"`;

    execSync(gitCloneCommand, { stdio: "pipe" });
    spinner.succeed(
      `Template cloned successfully into '${chalk.yellow(targetDir)}'.`
    );
  } catch (error) {
    spinner.fail("Failed to clone template repository.");
    if (error.stderr) console.error(chalk.red(error.stderr.toString()));
    process.exit(1);
  }

  const gitDirPath = path.join(targetDir, ".git");
  if (fs.existsSync(gitDirPath)) {
    log.step("Removing template's .git directory...");
    try {
      fs.removeSync(gitDirPath);
      console.log(
        chalk.green.bold(`${EMOJI.SPARKLES} Template .git directory removed.`)
      );
    } catch (error) {
      log.warning(
        `Could not remove .git directory: ${error.message}. Please remove it manually.`
      );
    }
  }

  let shouldInitializeGit = false;
  if (isGitAvailable()) {
    if (options.initGit) {
      shouldInitializeGit = true;
      log.step("--init-git flag used: Forcing git initialization.");
    } else if (options.noInitGit) {
      shouldInitializeGit = false;
      console.log(
        chalk.yellow.bold(
          `${EMOJI.SKIP} --no-init-git flag used: Skipping git initialization.`
        )
      );
    } else {
      try {
        const answers = await inquirer.prompt([
       
          {
            type: "confirm",
            name: "initGit",
            message: `${EMOJI.PROMPT} Initialize a new git repository in the project?`,
            default: true,
          },
        ]);
        shouldInitializeGit = answers.initGit;
      } catch (error) {
        log.warning(
          `Could not display interactive git prompt (${error.message}). Defaulting to no git initialization.`
        );
        shouldInitializeGit = false;
      }
    }
  } else {
    if (options.initGit) {
      log.warning(
        "--init-git flag used, but Git command not found. Cannot initialize repository."
      );
    } else {
      log.warning(
        "Git command not found. Skipping git repository initialization."
      );
    }
  }

  if (shouldInitializeGit) {
    console.log(
      chalk.blue.bold(
        `\n${EMOJI.GIT} Initializing a new git repository in '${chalk.yellow(
          targetDir
        )}'...`
      )
    );
    if (
      executeCommand("git init", {
        cwd: targetDir,
        errorMessage: "Failed to initialize git repository.",
      })
    ) {
      console.log(
        chalk.green.bold(`${EMOJI.SPARKLES} New git repository initialized.`)
      );
      log.step("Adding files to the new repository...");
      if (
        executeCommand("git add .", {
          cwd: targetDir,
          errorMessage: "Failed to add files to git.",
        })
      ) {
        log.step("Making initial commit...");
        const initialCommitMessage = `Initial commit: Bootstrap '${projectName}' from ReactTangoTemplate`;
        if (
          executeCommand(`git commit -m "${initialCommitMessage}"`, {
            cwd: targetDir,
            errorMessage: "Failed to make initial commit.",
          })
        ) {
          log.success(`Initial commit made: "${initialCommitMessage}"`);
        }
      }
    }
  }

  let ranAnyInstallation = false;
  let installChoicesMade = [];

  if (!options.skipAllInstall) {
    const packageJsonExists = fs.existsSync(
      path.join(targetDir, "package.json")
    );
    const requirementsTxtExists = fs.existsSync(
      path.join(targetDir, "requirements.txt")
    );

    const availableInstallOptions = [];

    if (requirementsTxtExists && packageJsonExists) {
      availableInstallOptions.push({
        name: `${EMOJI.ALL} Install All Dependencies (Backend + Frontend)`,
        value: "all",
      });
    }

    if (requirementsTxtExists) {
      availableInstallOptions.push({
        name: `${EMOJI.PYTHON} Backend Only (Python with venv)`,
        value: "backend",
      });
    }
    if (packageJsonExists) {
      availableInstallOptions.push({
        name: `${EMOJI.NODE} Frontend Only (Node.js with pnpm)`,
        value: "frontend",
      });
    }

    availableInstallOptions.push({
      name: `${EMOJI.NONE} Install None (Skip all installations)`,
      value: "none",
    });

    if (availableInstallOptions.length > 1) {
      if (options.installAll) {
        log.step(
          "--install-all flag used: Proceeding with all available installations."
        );
        if (requirementsTxtExists) installChoicesMade.push("backend");
        if (packageJsonExists) installChoicesMade.push("frontend");
      } else {
        try {
          console.log(chalk.magenta.bold("=".repeat(70)));
          console.log(
            chalk.magenta.bold(
              `${EMOJI.INSTALL} DEPENDENCY INSTALLATION OPTIONS ${EMOJI.INSTALL}`
            )
          );
          console.log(chalk.magenta.bold("=".repeat(70)));

          const answers = await inquirer.prompt([
            {
              type: "list",
              name: "installChoice",
              message: `${EMOJI.PROMPT} What dependencies would you like to install?`,
              choices: availableInstallOptions,
              default: "all",
            },
          ]);

          const selectedOption = answers.installChoice;

          if (selectedOption === "all") {
            if (requirementsTxtExists) installChoicesMade.push("backend");
            if (packageJsonExists) installChoicesMade.push("frontend");
            log.info(
              `Selected: ${chalk.green.bold("Install All Dependencies")}`
            );
          } else if (selectedOption === "none") {
            installChoicesMade = [];
            log.info(
              `Selected: ${chalk.yellow.bold("Skip All Installations")}`
            );
          } else {
            installChoicesMade = [selectedOption];
            const optionName =
              selectedOption === "backend" ? "Backend" : "Frontend";
            log.info(`Selected: ${chalk.cyan.bold(optionName + " Only")}`);
          }
        } catch (error) {
          log.warning(
            `Could not display interactive install prompt (${error.message}). Skipping installations.`
          );
          installChoicesMade = [];
        }
      }

      if (installChoicesMade.length > 0) {
        const installBe = installChoicesMade.includes("backend");
        const installFe = installChoicesMade.includes("frontend");
        const useVenvForBe = !options.noVenv && installBe;

        if (
          await runProjectSetup(targetDir, installBe, installFe, useVenvForBe)
        ) {
          ranAnyInstallation = true;
        }
      } else if (!options.installAll) {
        console.log(
          chalk.yellow.bold(
            `\n${EMOJI.SKIP} No dependencies selected for installation.`
          )
        );
      }
    } else {
      log.info(
        "No dependency manifest files (requirements.txt, package.json) found, or only 'None' option available. Skipping installation phase."
      );
    }
  } else {
    console.log(
      chalk.yellow.bold(
        `\n${EMOJI.SKIP} --skip-all-install flag used. All dependency installations are skipped.`
      )
    );
  }

  console.log(chalk.green.bold("\n" + "=".repeat(70)));
  log.party(
    `PROJECT '${chalk.yellow.bold(
      projectName.toUpperCase()
    )}' CREATED SUCCESSFULLY! ${EMOJI.ROCKET}`
  );
  console.log(chalk.green.bold("=".repeat(70)));

  console.log(chalk.blue.bold(`\n${EMOJI.NEXT_STEPS} NEXT STEPS:`));
  console.log(
    `  ${chalk.cyan.bold("1.")} ${chalk.yellow(`cd ${projectName}`)}`
  );

  let stepCounter = 2;
  if (!ranAnyInstallation && !options.skipAllInstall) {
    console.log(
      `  ${chalk.cyan.bold(`${stepCounter++}.`)} ${chalk.blue.bold(
        `${EMOJI.GEAR} Install dependencies manually if needed:`
      )}`
    );
    if (
      fs.existsSync(path.join(targetDir, "requirements.txt")) &&
      !installChoicesMade.includes("backend")
    ) {
      console.log(
        `     ${chalk.magenta.bold(`${EMOJI.PYTHON} Backend:`)} ${chalk.cyan(
          "python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
        )} (or equivalent for your OS)`
      );
    }
    if (
      fs.existsSync(path.join(targetDir, "package.json")) &&
      !installChoicesMade.includes("frontend")
    ) {
      console.log(
        `     ${chalk.green.bold(`${EMOJI.NODE} Frontend:`)} ${chalk.cyan(
          "pnpm install"
        )}`
      );
    }
  }

  if (!options.noVenv && installChoicesMade.includes("backend")) {
    const isWindows = os.platform() === "win32";
    const activateCmd = isWindows
      ? "venv\\Scripts\\activate"
      : "source venv/bin/activate";
    console.log(
      `  ${chalk.cyan.bold(`${stepCounter++}.`)} ${chalk.magenta.bold(
        `${EMOJI.PYTHON} Activate Python virtual environment:`
      )} ${chalk.cyan(activateCmd)}`
    );
  }

  console.log(
    `  ${chalk.cyan.bold(`${stepCounter++}.`)} ${chalk.green.bold(
      `${EMOJI.ROCKET} Start development server (if applicable):`
    )} ${chalk.cyan("pnpm run dev")}`
  );

  console.log(
    chalk.dim(
      "\n  For more details, check the README.md inside your new project."
    )
  );
  console.log(
    chalk.yellow.bold(`\n${EMOJI.SPARKLES} Happy coding! ${EMOJI.SPARKLES}`)
  );
}

function printBanner() {
  const banner = chalk.cyan.bold(`
╔═══════════════════════════════════════════════════════╗
║                 ${chalk.yellow.bold(
    "React Tango CLI"
  )}                       ║
║        ${chalk.green.bold("TanStack Router + Django Framework")}             ║
║                    ${chalk.magenta.bold(
    `v${__version__}`
  )}                             ║
╚═══════════════════════════════════════════════════════╝
`);
  console.log(banner);
}

async function main() {
  printBanner();

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
        log.error(`An unexpected error occurred: ${error.message}`);
        console.error(error.stack); 
        process.exit(1);
      }
    });

  program.parse(process.argv); 
}


const currentScriptPath = fileURLToPath(import.meta.url);
const scriptBeingRun = process.argv[1];

if (path.resolve(currentScriptPath) === path.resolve(scriptBeingRun)) {
  main().catch((error) => {
    log.error(`Fatal error in main execution: ${error.message}`);
    console.error(error.stack); 
    process.exit(1);
  });
}

export { main };