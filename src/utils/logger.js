import chalk from "chalk";
import { EMOJI } from "./constants.js";

export const log = {
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
