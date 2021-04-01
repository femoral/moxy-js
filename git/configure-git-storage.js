const simpleGit = require("simple-git");
const fs = require("fs");
const path = require("path");
const { resolvePrivateKey } = require("./private-key-resolver");

const branch = "master";
const remoteName = "origin";
const gitignore = `
.DS_Store
`;

const makeUploadChanges = async ({ remote, key, collectionsPath }) => {
  const keyPath = resolvePrivateKey(key);
  const git = simpleGit({
    baseDir: collectionsPath,
    maxConcurrentProcesses: 1,
  }).env(
    "GIT_SSH_COMMAND",
    `ssh -i ${keyPath} -o IdentitiesOnly=yes -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -F /dev/null`
  );

  const branchExistOnRemote = async () => {
    const branchSummary = await git.branch(["-r"]);
    return branchSummary.all.includes(`${remoteName}/${branch}`);
  };

  const initLocalRepository = async () => {
    if (!(await git.checkIsRepo())) {
      await git.init();
      fs.writeFileSync(path.join(collectionsPath, ".gitignore"), gitignore);
    }
  };

  const addGitConfig = async () => {
    await git
      .addConfig("user.name", "moxyd")
      .addConfig("user.email", "moxyd@moxyd.org")
      .addConfig(
        "core.sshCommand",
        `ssh -i ${keyPath} -o IdentitiesOnly=yes -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -F /dev/null`
      );
  };

  const initRemote = async () => {
    const remotes = await git.getRemotes();
    if (remotes.find((element) => element.name === remoteName)) {
      await git.remote(["set-url", remoteName, remote]);
    } else {
      await git.addRemote(remoteName, remote);
    }
  };

  const commit = async (message) => {
    await git.add(["-A"]);
    await git.commit(message);
  };

  const push = async (message) => {
    await commit(message);

    await git.fetch(remoteName, branch);

    if (await branchExistOnRemote()) {
      await git.rebase(["-X", "ours", `${remoteName}/${branch}`]);
    }

    await git.push(remoteName, branch);
  };

  await initLocalRepository();
  await addGitConfig();
  await initRemote();
  await git.fetch(remoteName, branch);
  await push("application startup" + new Date().toUTCString());

  return { push, commit };
};

module.exports = { makeUploadChanges };
