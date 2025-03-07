const { cmd, commands } = require("../command");
const yts = require("yt-search");
const { fetchJson } = require("../lib/functions");
const axios = require('axios');

async function ytmp4(url, format) {
  try {
    if (!url || !format) {
      throw new Error("URL and format parameters are required.");
    }
    const formatInt = parseInt(format.replace('p', ''), 10);
    const params = { button: 1, start: 1, end: 1, format: formatInt, url };
    const headers = {
      Accept: '*/*',
      'Accept-Encoding': "gzip, deflate, br",
      'Accept-Language': "en-GB,en-US;q=0.9,en;q=0.8",
      Origin: 'https://loader.to',
      Referer: "https://loader.to",
      'Sec-Ch-Ua': "\"Not-A.Brand\";v=\"99\", \"Chromium\";v=\"124\"",
      'Sec-Ch-Ua-Mobile': '?1',
      'Sec-Ch-Ua-Platform': "\"Android\"",
      'Sec-Fetch-Dest': "empty",
      'Sec-Fetch-Mode': "cors",
      'Sec-Fetch-Site': "cross-site",
      'User-Agent': "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36"
    };
    const response = await axios.get('https://ab.cococococ.com/ajax/download.php', { params, headers });
    const downloadId = response.data.id;

    async function checkProgress() {
      try {
        const progressResponse = await axios.get("https://p.oceansaver.in/ajax/progress.php", { params: { id: downloadId }, headers });
        const { progress, download_url, text } = progressResponse.data;
        if (text === "Finished") {
          return download_url;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        return checkProgress();
      } catch (error) {
        throw new Error("Error in progress check: " + error.message);
      }
    }

    return await checkProgress();
  } catch (error) {
    console.error("Error:", error);
    return { error: error.message };
  }
}

module.exports = { ytmp4 };

function extractYouTubeId(url) {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|playlist\?list=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function convertYouTubeLink(link) {
  const videoId = extractYouTubeId(link);
  return videoId ? "https://www.youtube.com/watch?v=" + videoId : link;
}

cmd({
  pattern: "play4",
  desc: "To download songs.",
  react: '☃️',
  category: "download",
  filename: __filename
}, async (message, match, args, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
  try {
    if (!q) {
      return reply("Please give me a URL or title.");
    }
    const youtubeLink = convertYouTubeLink(q);
    const searchResults = await yts(youtubeLink);
    const video = searchResults.videos[0];
    const videoUrl = video.url;
    const messageKey = await message.sendMessage(from, {
      image: { url: video.thumbnail },
      caption: `🎶 *KERM-MD-V1* 🎶\n━━━━━━━━━━━━━━━━━\n*⟣ Kerm Song Downloader ⟢*\n━━━━━━━━━━━━━━━━━\n
                **Title:** ${video.title}\n
                **Duration:** ${video.timestamp}\n
                **Author:** ${video.author.name}\n
                **Link:** ${video.url}\n
                **Album:** ${video.author.name}\n
                **Date:** ${video.ago}`
    }, { quoted });

    const messageId = messageKey.key.id;
    message.ev.on("messages.upsert", async update => {
      const newMessage = update.messages[0];
      if (!newMessage.message) return;
      
      const text = newMessage.message.conversation || newMessage.message.extendedTextMessage?.text;
      const remoteJid = newMessage.key.remoteJid;
      const isReplyToOriginal = newMessage.message.extendedTextMessage && newMessage.message.extendedTextMessage.contextInfo.stanzaId === messageId;
      
      if (isReplyToOriginal) {
        await message.sendMessage(remoteJid, { react: { text: '⬇️', key: newMessage.key } });
        const downloadLink = await fetchJson('https://api.ryzendesu.vip/api/downloader/ytmp3?url=' + videoUrl).result.download_url;
        
        await message.sendMessage(remoteJid, { delete: messageKey.key });
        await message.sendMessage(remoteJid, { react: { text: '⬆️', key: newMessage.key } });
        
        if (text === '1') {
          await message.sendMessage(remoteJid, {
            audio: { url: downloadLink },
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
          }, { quoted: newMessage });
          await message.sendMessage(remoteJid, { react: { text: '✅', key: newMessage.key } });
        } else if (text === '2') {
          await message.sendMessage(remoteJid, {
            document: { url: downloadLink },
            mimetype: "audio/mp3",
            fileName: video.title + ".mp3",
            caption: "\n> *© Generated for you By Kerm MD V1 ❤️*\n "
          }, { quoted: newMessage });
          await message.sendMessage(remoteJid, { react: { text: '✅', key: newMessage.key } });
        }
      }
    });
  } catch (error) {
    console.error(error);
    reply('' + error);
  }
});

// Repeat the same process for the other cmd commands