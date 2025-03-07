const { cmd, commands } = require("../command");
const yts = require("yt-search");
const { fetchJson } = require("../lib/functions");
const axios = require("axios");

/**
 * Télécharge une vidéo YouTube en MP4
 * @param {string} url - URL de la vidéo YouTube
 * @param {string} format - Format de la vidéo (ex: 720p)
 * @returns {Promise<string>} - Lien de téléchargement
 */
async function ytmp4(url, format) {
  try {
    if (!url || !format) {
      throw new Error("URL et format requis.");
    }

    const quality = parseInt(format.replace("p", ""), 10);
    const params = { button: 1, start: 1, end: 1, format: quality, url };

    const headers = {
      Accept: "*/*",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
      Origin: "https://loader.to",
      Referer: "https://loader.to",
      "Sec-Ch-Ua": '"Not-A.Brand";v="99", "Chromium";v="124"',
      "Sec-Ch-Ua-Mobile": "?1",
      "Sec-Ch-Ua-Platform": '"Android"',
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "cross-site",
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
    };

    const response = await axios.get("https://ab.cococococ.com/ajax/download.php", {
      params,
      headers,
    });

    const downloadId = response.data.id;

    async function checkProgress() {
      try {
        const progressResponse = await axios.get("https://p.oceansaver.in/ajax/progress.php", {
          params: { id: downloadId },
          headers,
        });

        const { progress, download_url, text } = progressResponse.data;

        if (text === "Finished") {
          return download_url;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
        return checkProgress();
      } catch (err) {
        throw new Error("Erreur lors de la vérification de progression: " + err.message);
      }
    }

    return await checkProgress();
  } catch (err) {
    console.error("Erreur:", err);
    return { error: err.message };
  }
}

module.exports = { ytmp4 };

/**
 * Extrait l'ID d'une vidéo YouTube
 * @param {string} url - URL de la vidéo
 * @returns {string|null} - ID de la vidéo ou null si non valide
 */
function extractYouTubeId(url) {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|playlist\?list=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

/**
 * Convertit une URL courte YouTube en une URL complète
 * @param {string} url - URL d'origine
 * @returns {string} - URL complète
 */
function convertYouTubeLink(url) {
  const videoId = extractYouTubeId(url);
  return videoId ? `https://www.youtube.com/watch?v=${videoId}` : url;
}

/**
 * Commande pour télécharger une chanson YouTube
 */
cmd(
  {
    pattern: "play4",
    desc: "Télécharge une chanson YouTube.",
    react: "🎵",
    category: "download",
    filename: __filename,
  },
  async (client, message, args, { from, q, reply }) => {
    try {
      if (!q) return reply("Veuillez fournir un titre ou une URL.");

      const searchQuery = convertYouTubeLink(q);
      const searchResults = await yts(searchQuery);

      if (!searchResults.videos.length) return reply("Aucune vidéo trouvée.");

      const video = searchResults.videos[0];
      const downloadUrl = video.url;

      const sentMessage = await client.sendMessage(
        from,
        {
          image: { url: video.thumbnail },
          caption: `🎶 *KERM-MD V1* 🎶\n\n💿 *Titre:* ${video.title}\n⏳ *Durée:* ${video.timestamp}\n\n🔽 Répondez avec *1* pour télécharger en audio.\n🔽 Répondez avec *2* pour télécharger en document.\n\n© 2025 || Kerm MD`,
        },
        { quoted: message }
      );

      const messageId = sentMessage.key.id;

      client.ev.on("messages.upsert", async (data) => {
        const msg = data.messages[0];
        if (!msg.message) return;

        const userResponse = msg.message.conversation || msg.message.extendedTextMessage?.text;
        const isReplyToBot = msg.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;

        if (isReplyToBot) {
          await client.sendMessage(from, {
            react: { text: "⬇️", key: msg.key },
          });

          const response = await fetchJson(
            `https://api.ryzendesu.vip/api/downloader/ytmp3?url=${downloadUrl}`
          );

          if (!response.result.download_url) {
            return reply("Erreur lors du téléchargement.");
          }

          const fileUrl = response.result.download_url;

          await client.sendMessage(from, { delete: sentMessage.key });

          await client.sendMessage(from, {
            react: { text: "⬆️", key: msg.key },
          });

          if (userResponse === "1") {
            await client.sendMessage(
              from,
              {
                audio: { url: fileUrl },
                mimetype: "audio/mpeg",
                contextInfo: {
                  externalAdReply: {
                    title: video.title,
                    body: video.videoId,
                    mediaType: 1,
                    sourceUrl: video.url,
                    thumbnailUrl: video.thumbnail,
                    renderLargerThumbnail: true,
                    showAdAttribution: true,
                  },
                },
              },
              { quoted: msg }
            );
          } else if (userResponse === "2") {
            await client.sendMessage(
              from,
              {
                document: { url: fileUrl },
                mimetype: "audio/mp3",
                fileName: `${video.title}.mp3`,
                caption: "🎶 Téléchargé avec *Kerm MD V1* ❤️",
              },
              { quoted: msg }
            );
          }

          await client.sendMessage(from, {
            react: { text: "✅", key: msg.key },
          });
        }
      });
    } catch (err) {
      console.log(err);
      reply("Erreur: " + err.message);
    }
  }
);