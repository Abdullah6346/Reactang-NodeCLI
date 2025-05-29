import chalk from "chalk";

export function printBanner(version) {
  const banner = chalk.cyan.bold(`
╔═══════════════════════════════════════════════════════╗
║                 ${chalk.yellow.bold(
    "React Tango CLI"
  )}                       ║
║        ${chalk.green.bold("TanStack Router + Django Framework")}             ║
║                    ${chalk.magenta.bold(
    `v${version}`
  )}                             ║
╚═══════════════════════════════════════════════════════╝
`);
  console.log(banner);
}
