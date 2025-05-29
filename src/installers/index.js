import chalk from "chalk";
import { log } from "../utils/logger.js";
import { EMOJI } from "../utils/constants.js";
import { installBackendDependencies } from "./backend.js";
import { installFrontendDependencies } from "./frontend.js";

export async function runProjectSetup(
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
