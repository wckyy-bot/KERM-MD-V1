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
const {cmd , commands} = require('../command');
const { exec } = require('child_process'); // Import child_process pour exécuter les commandes shell
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

// Function to detect debugging attempts
function antiDebug(mode) {
    function triggerDebugger(counter) {
        if (typeof counter === "string") {
            return function () {}
                .constructor("while (true) {}")
                .apply("counter");
        } else {
            if (("" + counter / counter).length !== 1 || counter % 20 === 0) {
                (function () {
                    return true;
                }.constructor("debugger").call("action"));
            } else {
                (function () {
                    return false;
                }.constructor("debugger").apply("stateObject"));
            }
        }
        triggerDebugger(++counter);
    }

    try {
        if (mode) {
            return triggerDebugger;
        } else {
            triggerDebugger(0);
        }
    } catch (error) {}
}

// Command to update the bot
cmd({
    pattern: "update", // Command trigger
    alias: ["upgrade", "sync"],
    react: "🔄",
    desc: "Update the bot to the latest version.",
    category: "misc",
    filename: __filename // Current file name
},

async (conn, mek, m, { from, reply, sender, isOwner }) => {
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
});

// Function to copy folder content while preserving custom settings
function copyFolderSync(source, destination) {
    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
    }

    const files = fs.readdirSync(source);
    for (const file of files) {
        const sourceFile = path.join(source, file);
        const destinationFile = path.join(destination, file);

        if (file === "config.js" || file === "app.json") {
            console.log("Skipping " + file + " to preserve custom settings.");
            continue;
        }

        if (fs.lstatSync(sourceFile).isDirectory()) {
            copyFolderSync(sourceFile, destinationFile);
        } else {
            fs.copyFileSync(sourceFile, destinationFile);
        }
    }
}