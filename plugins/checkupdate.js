const { cmd } = require("../command");
const { exec } = require('child_process');
const moment = require("moment");

cmd({
    pattern: "checkupdate",
    desc: "Check the latest updates from the repository.",
    category: "info",
    react: "🔄",
    filename: __filename
}, async (conn, mek, m, { reply, from }) => {
    try {
        const repoPath = "/path/to/KERM-MD-V1"; // Remplacez par le chemin réel de votre dépôt
        const maxCommits = 10; // Nombre de commits à afficher

        // Change to the repository directory
        process.chdir(repoPath);

        // Execute the git log command to get the latest commits with file changes
        exec(`git log -${maxCommits} --name-status --pretty=format:"%h - %an, %ar : %s"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing git log: ${error.message}`);
                reply(`Error executing git log: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Git log stderr: ${stderr}`);
                reply(`Git log stderr: ${stderr}`);
                return;
            }

            if (!stdout.trim()) {
                reply("No recent changes found.");
                return;
            }

            const currentTime = moment().format("HH:mm:ss");
            const currentDate = moment().format("dddd, MMMM Do YYYY");

            const formattedUpdates = `
🔄 *KERM MD V1 LATEST UPDATES* 🔄
🕒 *Time*: ${currentTime}
📅 *Date*: ${currentDate}
            
*Latest ${maxCommits} commits:*
${stdout}
            `.trim();

            reply(formattedUpdates);
        });
    } catch (err) {
        console.error(`Failed to check updates: ${err.message}`);
        reply(`Failed to check updates: ${err.message}`);
    }
});