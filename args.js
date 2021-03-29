const yargs = require("yargs/yargs");
const { hideBin } = require('yargs/helpers')

module.exports = yargs(hideBin(process.argv))
  .option("port", {
    alias: "p",
    type: "number",
    description: "Port of the main server, where control panel will be served",
    default: 3500,
  })
  .option("child-port", {
    alias: "c",
    type: "number",
    description:
      "Port of the child server, where mocks & proxies will be served",
    default: 3501,
  })
  .option("debounce", {
    alias: "d",
    type: "number",
    description:
      "Debounce time in milliseconds for child server restarts",
    default: 5000,
  })
  .option("skip-open", {
    alias: "s",
    type: "boolean",
    description:
      "Skip browser launch",
    default: false,
  }).argv;