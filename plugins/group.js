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

const config = require('../config')
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')

cmd({
    pattern: "promote",
    react: "🥏",
    alias: ["addadmin"],
    desc: "Promote a user to admin.",
    category: "group",
    filename: __filename
}, async (conn, mek, m, {
    from,
    quoted,
    isGroup,
    isAdmins,
    isOwner,
    participants,
    isBotAdmins,
    reply
}) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        if (!isAdmins && !isOwner) return reply("❌ Only group admins or the owner can use this command.");
        if (!isBotAdmins) return reply("❌ I need admin privileges to promote members.");

        // ➡️ Détecter le participant à promouvoir (en réponse ou mention)
        let target;
        if (m.quoted) {
            target = m.quoted.sender;
        } else if (m.mentionedJid && m.mentionedJid.length > 0) {
            target = m.mentionedJid[0];
        } else if (m.msg && m.msg.contextInfo && m.msg.contextInfo.mentionedJid && m.msg.contextInfo.mentionedJid.length > 0) {
            target = m.msg.contextInfo.mentionedJid[0];
        }

        if (!target) return reply("❌ Please mention or reply to a user to promote.");

        // ➡️ Vérifier si l'utilisateur est déjà admin
        const isAlreadyAdmin = participants.some(p => p.id === target && p.admin !== null);
        if (isAlreadyAdmin) return reply("❗ User is already an admin.");

        // ➡️ Promouvoir le participant
        await conn.groupParticipantsUpdate(from, [target], "promote")
            .catch(err => {
                console.error(`⚠️ Failed to promote ${target}:`, err);
                return reply("❌ An error occurred while promoting the participant.");
            });

        // ➡️ Extraire le tag à partir du JID
        const tag = target.split('@')[0];
        reply(`*_@${tag} promoted successfully_*`, { mentions: [target] });

    } catch (error) {
        console.error('Error while executing promote:', error);
        reply('❌ An error occurred while executing the command.');
    }
});

cmd({
    pattern: "demote",
    react: "🥏",
    alias: ["removeadmin"],
    desc: "Demote a user from admin.",
    category: "group",
    filename: __filename
}, async (conn, mek, m, {
    from,
    quoted,
    isGroup,
    isAdmins,
    isOwner,
    participants,
    isBotAdmins,
    reply
}) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        if (!isAdmins && !isOwner) return reply("❌ Only group admins or the owner can use this command.");
        if (!isBotAdmins) return reply("❌ I need admin privileges to demote members.");

        // ➡️ Détecter le participant à rétrograder (en réponse ou mention)
        let target;
        if (m.quoted) {
            target = m.quoted.sender;
        } else if (m.mentionedJid && m.mentionedJid.length > 0) {
            target = m.mentionedJid[0];
        } else if (m.msg && m.msg.contextInfo && m.msg.contextInfo.mentionedJid && m.msg.contextInfo.mentionedJid.length > 0) {
            target = m.msg.contextInfo.mentionedJid[0];
        }

        if (!target) return reply("❌ Please mention or reply to a user to demote.");

        // ➡️ Vérifier si l'utilisateur est bien admin
        const isAdmin = participants.some(p => p.id === target && p.admin !== null);
        if (!isAdmin) return reply("❗ User is not an admin.");

        // ➡️ Rétrograder le participant
        await conn.groupParticipantsUpdate(from, [target], "demote")
            .catch(err => {
                console.error(`⚠️ Failed to demote ${target}:`, err);
                return reply("❌ An error occurred while demoting the participant.");
            });

        // ➡️ Extraire le tag à partir du JID
        const tag = target.split('@')[0];
        reply(`*_@${tag} demoted successfully_*`, { mentions: [target] });

    } catch (error) {
        console.error('Error while executing demote:', error);
        reply('❌ An error occurred while executing the command.');
    }
});

cmd({
    pattern: "ginfo",
    react: "🥏",
    alias: ["groupinfo"],
    desc: "Get group information.",
    category: "group",
    use: '.ginfo',
    filename: __filename
},
async (conn, mek, m, {
    from,
    quoted,
    isGroup,
    isOwner,
    isAdmins,
    isBotAdmins,
    participants,
    reply
}) => {
    try {
        // Ensure the command is executed in a group
        if (!isGroup) return reply(`❌ This command can only be used in groups.`);

        // Ensure the user is an admin or the owner
        if (!isAdmins && !isOwner) return reply(`❌ Only admins and the owner can use this command.`);

        // Ensure the bot has admin privileges
        if (!isBotAdmins) return reply(`❌ I need admin privileges to execute this command.`);

        // Fetch the default reply messages
        const msr = (await fetch('https://raw.githubusercontent.com/JawadYTX/KHAN-DATA/refs/heads/main/MSG/mreply.json')
            .then(res => res.json())).replyMsg;

        // Attempt to get the group profile picture, fallback if unavailable
        const defaultImages = [
            'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
            'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
            'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
        ];

        let ppUrl = await conn.profilePictureUrl(from, 'image').catch(() => null);
        if (!ppUrl) {
            ppUrl = defaultImages[Math.floor(Math.random() * defaultImages.length)];
        }

        // Get group metadata
        const metadata = await conn.groupMetadata(from);
        const groupAdmins = participants.filter(p => p.admin);
        const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n');
        const owner = metadata.owner;

        // Build the group information message
        const gdata = `*「 Group Information 」*\n
📛 *Group Name:* ${metadata.subject}
🆔 *Group Jid:* ${metadata.id}
👥 *Participant Count:* ${metadata.size}
👑 *Group Creator:* @${owner.split('@')[0]}
📝 *Group Description:* ${metadata.desc?.toString() || 'No description provided'}\n
⭐ *Group Admins:* \n${listAdmin}\n`;

        // Send the group information message with the profile picture
        await conn.sendMessage(from, {
            image: { url: ppUrl },
            caption: gdata + config.FOOTER
        }, { quoted: mek });

    } catch (e) {
        // React with ❌ and send an error message
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        console.error('Error in ginfo command:', e);
        reply(`❌ *An error occurred!!*\n\n${e}`);
    }
});