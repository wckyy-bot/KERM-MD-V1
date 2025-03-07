/*
_  ______   _____ _____ _____ _   _
| |/ / ___| |_   _| ____/___ | | | |
| ' / |  _    | | |  _|| |   | |_| |
| . \ |_| |   | | | |__| |___|  _  |
|_|\_\____|   |_| |_____\____|_| |_|

ANYWAY, YOU MUST GIVE CREDIT TO MY CODE WHEN COPY IT
CONTACT ME HERE +237656520674
YT: KermHackTools
Github: Kgtech-cmr
*/

const onceWrapper = (function () {
  let executed = true;
  return function (context, func) {
    const wrapper = executed
      ? function () {
          if (func) {
            const result = func.apply(context, arguments);
            func = null;
            return result;
          }
        }
      : function () {};
    executed = false;
    return wrapper;
  };
})();

(function () {
  onceWrapper(this, function () {
    const regexFunction = new RegExp("function *\\( *\\)");
    const regexIncrement = new RegExp("\\+\\+ *(?:[a-zA-Z_$][0-9a-zA-Z_$]*)", "i");
    const obfuscatedFunction = antiDebug("init");

    if (!regexFunction.test(obfuscatedFunction + "chain") || !regexIncrement.test(obfuscatedFunction + "input")) {
      obfuscatedFunction("0");
    } else {
      antiDebug();
    }
  })();
})();

// Prevents console debugging
const protectConsole = (function () {
  let initialized = true;
  return function (context, func) {
    const wrapper = initialized
      ? function () {
          if (func) {
            const result = func.apply(context, arguments);
            func = null;
            return result;
          }
        }
      : function () {};
    initialized = false;
    return wrapper;
  };
})();

const disableConsole = protectConsole(this, function () {
  let globalContext;
  try {
    const getGlobal = Function("return (function() {}.constructor('return this')());");
    globalContext = getGlobal();
  } catch (error) {
    globalContext = window;
  }

  const consoleMethods = globalContext.console || {};
  const methodsToProtect = ["log", "warn", "info", "error", "exception", "table", "trace"];

  for (let i = 0; i < methodsToProtect.length; i++) {
    const method = methodsToProtect[i];
    const originalMethod = consoleMethods[method] || function () {};
    
    const proxyMethod = protectConsole.constructor.prototype.bind(protectConsole);
    proxyMethod.__proto__ = protectConsole.bind(protectConsole);
    proxyMethod.toString = originalMethod.toString.bind(originalMethod);

    consoleMethods[method] = proxyMethod;
  }
});
disableConsole();

// Import required modules
const { cmd } = require("../command");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");

// Define the update command
cmd(
  {
    pattern: "update",
    alias: ["upgrade", "sync"],
    react: "🆕",
    desc: "Update the bot to the latest version.",
    category: "misc",
    filename: __filename,
  },
  async (context, match, args, { from, reply, sender, isOwner }) => {
    if (!isOwner) {
      return reply("This command is only for the bot owner.");
    }

    try {
      await reply("```🔍 Checking for KERM-MD-V1 updates...```\n");

      // Fetch the latest commit hash
      const { data: githubData } = await axios.get(
        "https://api.github.com/repos/kgtech-cmr/KERM-MD-V1/commits/main"
      );
      const latestCommit = githubData.sha;

      // Get the current commit hash
      let currentCommit = "unknown";
      try {
        const packageData = require("../package.json");
        currentCommit = packageData.commitHash || "unknown";
      } catch (error) {
        console.error("Error reading package.json:", error);
      }

      if (latestCommit === currentCommit) {
        return reply("```✅ Your KERM-MD-V1 bot is already up-to-date!```\n");
      }

      await reply("```KERM-MD-V1 Bot Updating...🚀```\n");

      // Download the latest update
      const updatePath = path.join(__dirname, "latest.zip");
      const { data: zipData } = await axios.get(
        "https://github.com/kgtech-cmr/KERM-MD-V1/archive/main.zip",
        { responseType: "arraybuffer" }
      );
      fs.writeFileSync(updatePath, zipData);

      await reply("```📦 Extracting the latest code...```\n");

      // Extract and replace files
      const extractPath = path.join(__dirname, "latest");
      const zip = new AdmZip(updatePath);
      zip.extractAllTo(extractPath, true);

      await reply("```🔄 Replacing files...```\n");

      const sourcePath = path.join(extractPath, "KERM-MD-V1-main");
      const destinationPath = path.join(__dirname, "..");
      copyFolderSync(sourcePath, destinationPath);

      // Cleanup
      fs.unlinkSync(updatePath);
      fs.rmSync(extractPath, { recursive: true, force: true });

      await reply("```🔄 Restarting the bot to apply updates...```\n");
      process.exit(0);
    } catch (error) {
      console.error("Update error:", error);
      reply("❌ Update failed. Please try manually.");
    }
  }
);