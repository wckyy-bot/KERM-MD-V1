
const ytdl = require('ytdl-core');
const yts = require("yt-search");
const { cmd } = require("../command");

function extractYouTubeId(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|playlist\?list=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function convertYouTubeLink(link) {
    const id = extractYouTubeId(link);
    return id ? "https://www.youtube.com/watch?v=" + id : link;
}

cmd({
    pattern: "play4",
    desc: "To download songs.",
    react: '☃️',
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q) {
            return reply("Please give me a URL or title.");
        }
        q = convertYouTubeLink(q);
        const searchResults = await yts(q);
        const video = searchResults.videos[0];
        const videoUrl = video.url;
        const message = await conn.sendMessage(from, {
            image: { url: video.thumbnail },
            caption: `🎶 *𝖪𝖤𝖱𝖬-𝖬𝖣－𝖵1* 🎶\n━━━━━━━━━━━━━━━━━\n*⟣ Kᴇʀᴍ Sᴏɴɢ Dᴏᴡɴʟᴏᴀᴅᴇʀ ⟢*\n━━━━━━━━━━━━━━━━━\n*🎵 Title:* ${video.title}\n*🕒 Duration:* ${video.timestamp}\n*🌐 URL:* ${video.url}`
        }, { quoted: mek });

        const messageId = message.key.id;
        conn.ev.on("messages.upsert", async (msg) => {
            const message = msg.messages[0];
            if (!message.message) return;

            const text = message.message.conversation || message.message.extendedTextMessage?.text;
            const remoteJid = message.key.remoteJid;
            const isReplyToBot = message.message.extendedTextMessage && message.message.extendedTextMessage.contextInfo.stanzaId === messageId;

            if (isReplyToBot) {
                await conn.sendMessage(remoteJid, { react: { text: '⬇️', key: message.key } });

                const downloadInfo = await ytdl.getInfo(videoUrl);
                const audioFormats = ytdl.filterFormats(downloadInfo.formats, 'audioonly');
                const audioUrl = audioFormats[0].url;

                await conn.sendMessage(remoteJid, { delete: message.key });
                await conn.sendMessage(remoteJid, { react: { text: '⬆️', key: message.key } });

                await conn.sendMessage(remoteJid, {
                    audio: { url: audioUrl },
                    mimetype: "audio/mpeg",
                    contextInfo: {
                        externalAdReply: {
                            title: video.title,
                            body: video.videoId,
                            mediaType: 1,
                            sourceUrl: video.url,
                            thumbnailUrl: video.thumbnail,
                            renderLargerThumbnail: true,
                            showAdAttribution: true
                        }
                    }
                }, { quoted: message });

                await conn.sendMessage(remoteJid, { react: { text: '✅', key: message.key } });
            }
        });
    } catch (error) {
        console.error(error);
        reply('' + error);
    }
});