const {childPort, port, debounce, skipOpen} = require("./args");
const {default: moxy} = require("moxy-js-server");
const {CONFIG_DIRECTORY, init} = require("./config");
const express = require("express");
const open = require("open");

init()

const {
  childController,
  moxyApiRouter
} = moxy({
  childPort,
  configPath: CONFIG_DIRECTORY,
  debounceTime: debounce,
});
const app = express();

app.get("/", (req, res) => res.redirect("/web"))
app.use("/web", express.static("node_modules/moxy-js-spa/build"));
app.use(moxyApiRouter);

app.listen(port, async () => {
  console.log(`API server started on port ${port}`);

  try {
    await childController.start();
  } catch (e) {
    console.error("Error while starting child server", e);
    process.exit(1);
  }

  console.log(`Access with browser at: http://localhost:${port}`);

  if (!skipOpen)
    try {
      await open(`http://localhost:${port}`)
    } catch (e) {
      console.error(`Error while opening browser at: http://localhost:${port}`, e)
    }
})