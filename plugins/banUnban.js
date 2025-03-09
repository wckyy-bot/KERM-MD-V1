const { cmd } = require("../command");
const fs = require('fs');
const path = require('path');

// Path to the JSON file
const bannedNumbersFilePath = path.resolve(__dirname, '../lib/diary.json');

// Helper functions to read and write to the JSON file
const readBannedNumbers = () => {
    const data = fs.readFileSync(bannedNumbersFilePath);
    return JSON.parse(data);
};

const writeBannedNumbers = (numbers) => {
    fs.writeFileSync(bannedNumbersFilePath, JSON.stringify({ bannedNumbers: numbers }, null, 2));
};

// Check if the user is an admin or the owner
const isAdminOrOwner = async (conn, groupId, userId) => {
    const groupMetadata = await conn.groupMetadata(groupId);
    const groupAdmins = groupMetadata.participants.filter(participant => participant.admin !== null).map(admin => admin.id);
    const botOwner = conn.user.jid;
    return groupAdmins.includes(userId) || botOwner === userId;
};

// Command to ban a user
cmd({ pattern: "ban", desc: "Ban a user from the group", category: "admin", react: "⛔", filename: __filename }, async (conn, mek, m, { from, args, q, reply, sender }) => {
    if (!await isAdminOrOwner(conn, from, sender)) return reply("You don't have permission to use this command.");
    if (!q) return reply("Please provide a number to ban.");
    let bannedNumbers = readBannedNumbers().bannedNumbers;
    if (!bannedNumbers.includes(q)) {
        bannedNumbers.push(q);
        writeBannedNumbers(bannedNumbers);
        reply(`User ${q} has been banned.`);
    } else {
        reply(`User ${q} is already banned.`);
    }
});

// Command to unban a user
cmd({ pattern: "unban", desc: "Unban a user from the group", category: "admin", react: "✅", filename: __filename }, async (conn, mek, m, { from, args, q, reply, sender }) => {
    if (!await isAdminOrOwner(conn, from, sender)) return reply("You don't have permission to use this command.");
    if (!q) return reply("Please provide a number to unban.");
    let bannedNumbers = readBannedNumbers().bannedNumbers;
    if (bannedNumbers.includes(q)) {
        bannedNumbers = bannedNumbers.filter(number => number !== q);
        writeBannedNumbers(bannedNumbers);
        reply(`User ${q} has been unbanned.`);
    } else {
        reply(`User ${q} is not banned.`);
    }
});

// Event listener for new participants
conn.on('group-participants-update', async (update) => {
    const { action, participants, id } = update;
    if (action === 'add') {
        let bannedNumbers = readBannedNumbers().bannedNumbers;
        for (let participant of participants) {
            const participantNumber = participant.split('@')[0];
            if (bannedNumbers.includes(participantNumber)) {
                await conn.groupRemove(id, [participant]);
                console.log(`Removed banned user ${participant} from group ${id}.`);
            }
        }
    }
});