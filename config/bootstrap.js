const { configureLocalStorage } = require("./configure-local-storage");
const { makeUploadChanges } = require("../git");
const {
  childPort,
  debounce,
  port,
  skipOpen,
  git: { pushInterval, privateKey, remote },
} = require("./args");
const { default: moxy } = require("moxy-js-server");

const oneMinuteInMilliseconds = 60000;

module.exports = {
  bootstrap: async () => {
    const { collectionsPath, configPath } = configureLocalStorage();
    const { childController, moxyApiRouter } = moxy({
      childPort,
      configPath: configPath,
      debounceTime: debounce,
    });

    const { commit, push } = remote
      ? await makeUploadChanges({
          collectionsPath,
          remote: remote,
          key: privateKey,
        })
      : { commit: () => {}, push: () => {} };

    if (remote) {
      setInterval(async () => {
        await push("Periodic commit: " + new Date().toUTCString());
      }, pushInterval * oneMinuteInMilliseconds);
    }

    return {
      commit,
      childController,
      moxyApiRouter,
      collectionsPath,
      configPath,
      port,
      skipOpen,
    };
  },
};
