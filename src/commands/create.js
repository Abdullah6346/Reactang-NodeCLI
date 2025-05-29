import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import { execSync } from "child_process";
import fs from "fs-extra";
import path from "path";
import os from "os";

import { EMOJI, TEMPLATE_REPO_URL } from "../utils/constants.js";
import { log } from "../utils/logger.js";
import { isGitAvailable, executeCommand } from "../utils/system.js";
import { runProjectSetup } from "../installers/index.js";

export async function handleCreateProject(projectName, options) {
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
  let installChoicesMade = []; // "backend", "frontend"

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

    if (
      availableInstallOptions.length > 1 &&
      (packageJsonExists || requirementsTxtExists)
    ) {
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
              default:
                requirementsTxtExists && packageJsonExists
                  ? "all"
                  : requirementsTxtExists
                  ? "backend"
                  : packageJsonExists
                  ? "frontend"
                  : "none",
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
    } else if (
      availableInstallOptions.length === 1 &&
      availableInstallOptions[0].value === "none"
    ) {
      log.info(
        "No dependency manifest files (requirements.txt, package.json) found. Skipping installation phase."
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
  const installedBackend =
    ranAnyInstallation && installChoicesMade.includes("backend");
  // const installedFrontend = ranAnyInstallation && installChoicesMade.includes("frontend"); // Not used directly

  const suggestManualBackend =
    fs.existsSync(path.join(targetDir, "requirements.txt")) &&
    !installedBackend;
  const suggestManualFrontend =
    fs.existsSync(path.join(targetDir, "package.json")) &&
    !(ranAnyInstallation && installChoicesMade.includes("frontend"));

  if (
    !options.skipAllInstall &&
    (suggestManualBackend || suggestManualFrontend)
  ) {
    console.log(
      `  ${chalk.cyan.bold(`${stepCounter++}.`)} ${chalk.blue.bold(
        `${EMOJI.GEAR} Install dependencies manually if needed:`
      )}`
    );
    if (suggestManualBackend) {
      console.log(
        `     ${chalk.magenta.bold(`${EMOJI.PYTHON} Backend:`)} ${chalk.cyan(
          "python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
        )} (or equivalent for your OS)`
      );
    }
    if (suggestManualFrontend) {
      console.log(
        `     ${chalk.green.bold(`${EMOJI.NODE} Frontend:`)} ${chalk.cyan(
          "pnpm install"
        )}`
      );
    }
  }

  if (installedBackend && !options.noVenv) {
    // Check if backend was installed and venv was used
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
