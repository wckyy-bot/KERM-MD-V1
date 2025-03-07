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
            console.log("Aucun URL ou titre fourni.");
            return reply("Please provide a URL or title.");
        }
        q = convertYouTubeLink(q);
        console.log("Recherche de la vidéo YouTube pour :", q);
        const searchResults = await yts(q);
        const video = searchResults.videos[0];
        if (!video) {
            console.log("Aucune vidéo trouvée.");
            return reply("No video found for the provided URL or title.");
        }
        const videoUrl = video.url;
        const message = await conn.sendMessage(from, {
            image: { url: video.thumbnail },
            caption: `🎶 *KERM-MD-V1* 🎶\n━━━━━━━━━━━━━━━━━\n*⟣ Kᴇʀᴍ Sᴏɴɢ Dᴏᴡɴʟᴏᴀᴅᴇʀ ⟢*\n━━━━━━━━━━━━━━━━━\n*🎵 Title:* ${video.title}\n*🕒 Duration:* ${video.timestamp}\n*🌐 URL:* ${video.url}\n\nReply with:\n1️⃣ for audio\n2️⃣ for audio file`
        }, { quoted: mek });

        const messageId = message.key.id;
        conn.ev.on("messages.upsert", async (msg) => {
            const message = msg.messages[0];
            if (!message.message) return;

            const text = message.message.conversation || message.message.extendedTextMessage?.text;
            const remoteJid = message.key.remoteJid;
            const isReplyToBot = message.message.extendedTextMessage && message.message.extendedTextMessage.contextInfo.stanzaId === messageId;

            if (isReplyToBot) {
                console.log("Réponse reçue : ", text);
                await conn.sendMessage(remoteJid, { react: { text: '⬇️', key: message.key } });

                try {
                    console.log("Obtention des informations de téléchargement pour :", videoUrl);
                    const downloadInfo = await ytdl.getInfo(videoUrl);
                    const audioFormats = ytdl.filterFormats(downloadInfo.formats, 'audioonly');
                    const audioUrl = audioFormats[0].url;

                    console.log("URL de l'audio obtenue :", audioUrl);
                    if (!audioUrl) {
                        console.error("URL de l'audio non valide.");
                        return reply("Failed to obtain a valid audio URL.");
                    }

                    await conn.sendMessage(remoteJid, { delete: message.key });
                    await conn.sendMessage(remoteJid, { react: { text: '⬆️', key: message.key } });

                    if (text === '1') {
                        console.log("Envoi de l'audio.");
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
                    } else if (text === '2') {
                        console.log("Envoi du fichier audio.");
                        await conn.sendMessage(remoteJid, {
                            document: { url: audioUrl },
                            mimetype: "audio/mpeg",
                            fileName: `${video.title}.mp3`,
                            caption: "\n> *© Generated for you by KERM-MD-V1 ❤️*\n"
                        }, { quoted: message });
                        await conn.sendMessage(remoteJid, { react: { text: '✅', key: message.key } });
                    } else {
                        console.log("Texte inattendu reçu :", text);
                    }
                } catch (err) {
                    console.error("Erreur lors de l'obtention des informations de téléchargement :", err);
                    reply("Failed to download the audio. Please try again later.");
                }
            }
        });
    } catch (error) {
        console.error("Erreur dans la commande play4 :", error);
        reply('' + error);
    }
});