const {
  cmd,
  commands
} = require("../command");
const yts = require("yt-search");
const {
  fetchJson
} = require("../lib/functions");
const axios = require('axios');

async function ytmp4(url, format) {
  try {
    if (!url || !format) {
      throw new Error("url and format parameters are required.");
    }
    const parsedFormat = parseInt(format.replace('p', ''), 10);
    const params = {
      'button': 1,
      'start': 1,
      'end': 1,
      'format': parsedFormat,
      'url': url
    };
    const headers = {
      'Accept': '*/*',
      'Accept-Encoding': "gzip, deflate, br",
      'Accept-Language': "en-GB,en-US;q=0.9,en;q=0.8",
      'Origin': 'https://loader.to',
      'Referer': "https://loader.to",
      'Sec-Ch-Ua': "\"Not-A.Brand\";v=\"99\", \"Chromium\";v=\"124\"",
      'Sec-Ch-Ua-Mobile': '?1',
      'Sec-Ch-Ua-Platform': "\"Android\"",
      'Sec-Fetch-Dest': "empty",
      'Sec-Fetch-Mode': "cors",
      'Sec-Fetch-Site': "cross-site",
      'User-Agent': "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36"
    };
    const response = await axios.get('https://ab.cococococ.com/ajax/download.php', {
      params: params,
      headers: headers
    });
    const downloadId = response.data.id;
    const checkProgress = async () => {
      const progressParams = {
        'id': downloadId
      };
      try {
        const progressResponse = await axios.get("https://p.oceansaver.in/ajax/progress.php", {
          params: progressParams,
          headers: headers
        });
        const {
          progress,
          download_url,
          text
        } = progressResponse.data;
        return text === "Finished" ? download_url : (await new Promise(resolve => setTimeout(resolve, 1000)), checkProgress());
      } catch (error) {
        throw new Error("Error in progress check: " + error.message);
      }
    };
    return await checkProgress();
  } catch (error) {
    console.error("Error:", error);
    return {
      'error': error.message
    };
  }
}

module.exports = {
  'ytmp4': ytmp4
};

function extractYouTubeId(url) {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|playlist\?list=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function convertYouTubeLink(link) {
  const id = extractYouTubeId(link);
  if (id) {
    return "https://www.youtube.com/watch?v=" + id;
  }
  return link;
}

cmd({
  'pattern': "play",
  'desc': "To download songs.",
  'react': '☃️',
  'category': "download",
  'filename': __filename
}, async (conn, mek, m, {
  from,
  quoted,
  body,
  isCmd,
  command,
  args,
  q,
  isGroup,
  sender,
  senderNumber,
  botNumber2,
  botNumber,
  pushname,
  isMe,
  isOwner,
  groupMetadata,
  groupName,
  participants,
  groupAdmins,
  isBotAdmins,
  isAdmins,
  reply
}) => {
  try {
    if (!q) {
      return reply("Please give me a URL or title.");
    }
    q = convertYouTubeLink(q);
    const searchResults = await yts(q);
    const video = searchResults.videos[0];
    const videoUrl = video.url;
    const message = await conn.sendMessage(from, {
      image: {
        url: video.thumbnail
      },
      caption: `🎶 *𝖪𝖤𝖱𝖬-𝖬𝖣－𝖵1* 🎶\n━━━━━━━━━━━━━━━━━\n*⟣ Kᴇʀᴍ Sᴏɴɢ Dᴏᴡɴʟᴏᴀᴅᴇʀ ⟢*\n━━━━━━━━━━━━━━━━━\n*🎵 Title:* ${video.title}\n*🕒 Duration:* ${video.timestamp}\n*🌐 URL:* ${video.url}\n\nReply with:\n1️⃣ for audio\n2️⃣ for audio file`
    }, {
      quoted: mek
    });

    const messageId = message.key.id;
    conn.ev.on("messages.upsert", async msg => {
      const message = msg.messages[0];
      if (!message.message) return;

      const text = message.message.conversation || message.message.extendedTextMessage?.text;
      const remoteJid = message.key.remoteJid;
      const isReplyToBot = message.message.extendedTextMessage && message.message.extendedTextMessage.contextInfo.stanzaId === messageId;

      if (isReplyToBot) {
        await conn.sendMessage(remoteJid, {
          react: {
            text: '⬇️',
            key: message.key
          }
        });

        try {
          console.log("URL de la vidéo :", videoUrl);
          const audioInfo = await fetchJson('https://api.ryzendesu.vip/api/downloader/ytmp3?url=' + videoUrl);
          console.log("Réponse de l'API :", audioInfo);
          if (audioInfo.status !== 'success') {
            console.error("Erreur lors de l'obtention de l'URL de l'audio :", audioInfo.message);
            return reply("Failed to obtain a valid audio URL.");
          }
          const audioUrl = audioInfo.result.download_url;
          console.log("URL de l'audio :", audioUrl);

          await conn.sendMessage(remoteJid, {
            delete: message.key
          });
          await conn.sendMessage(remoteJid, {
            react: {
              text: '⬆️',
              key: message.key
            }
          });

          if (text === '1') {
            console.log("Envoi de l'audio.");
            await conn.sendMessage(remoteJid, {
              audio: {
                url: audioUrl
              },
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
            }, {
              quoted: message
            });
            await conn.sendMessage(remoteJid, {
              react: {
                text: '✅',
                key: message.key
              }
            });
          } else if (text === '2') {
            console.log("Envoi du fichier audio.");
            await conn.sendMessage(remoteJid, {
              document: {
                url: audioUrl
              },
              mimetype: "audio/mpeg",
              fileName: `${video.title}.mp3`,
              caption: "\n> *© Generated for you by KERM-MD-V1 ❤️*\n"
            }, {
              quoted: message
            });
            await conn.sendMessage(remoteJid, {
              react: {
                text: '✅',
                key: message.key
              }
            });
          } else {
            console.log("Texte inattendu reçu :", text);
          }
        } catch (err) {
          console.error("Erreur lors de l'obtention de l'URL de l'audio :", err);
          reply("Failed to download the audio. Please try again later.");
        }
      }
    });
  } catch (error) {
    console.log(error);
    reply('' + error);
  }
});