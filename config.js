const { homedir } = require("os");
const { mkdir } = require("shelljs");

const CONFIG_DIRECTORY = homedir() + "/.moxy";
const COLLECTIONS_PATH = CONFIG_DIRECTORY + "/collections";

function init() {
  mkdir("-p", COLLECTIONS_PATH);
}

module.exports = {
  CONFIG_DIRECTORY,
  COLLECTIONS_PATH,
  init
}