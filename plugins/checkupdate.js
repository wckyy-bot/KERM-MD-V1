const { cmd } = require("../command");
const simpleGit = require('simple-git');
const moment = require("moment");

cmd({
    pattern: "checkupdate",
    desc: "Check the latest updates from the repository.",
    category: "info",
    react: "🔄",
    filename: __filename
}, async (conn, mek, m, { reply, from }) => {
    try {
        const repoPath = "./"; // Change to the actual path to your repository if needed
        const maxCommits = 10; // Number of commits to display

        // Initialize simple-git with the repository path
        const git = simpleGit(repoPath);

        // Get the latest commits with file changes
        const log = await git.log({ n: maxCommits });

        if (!log.all.length) {
            reply("Aucune modification récente trouvée.");
            return;
        }

        const currentTime = moment().format("HH:mm:ss");
        const currentDate = moment().format("dddd, MMMM Do YYYY");

        const formattedUpdates = `
🔄 *KERM MD V1 LATEST UPDATES* 🔄
🕒 *Time*: ${currentTime}
📅 *Date*: ${currentDate}
            
*Latest ${maxCommits} commits:*
${log.all.map(commit => `${commit.hash} - ${commit.author_name}, ${commit.fromNow()} : ${commit.message}`).join('\n')}
        `.trim();

        reply(formattedUpdates);
    } catch (err) {
        console.error(`Failed to check updates: ${err.message}`);
        reply(`Failed to check updates: ${err.message}`);
    }
});