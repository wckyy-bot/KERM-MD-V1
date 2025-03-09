const { cmd } = require("../command");
const yts = require("yt-search");
const axios = require("axios");

cmd({ pattern: "music2", alias: ["audio", "song"], desc: "Search and download audio from YouTube", category: "media", react: "🎧", filename: __filename }, async (conn, mek, m, { from, args, q, reply }) => {
    try {
        let videoUrl = q;
        if (!q.includes("youtube.com") && !q.includes("youtu.be")) {
            reply("*_🎐 Your song is downloading..._*");
            const searchResults = await yts(q);
            if (!searchResults.videos.length) return reply("No results found for your query.");
            videoUrl = searchResults.videos[0].url;
        }

        const apiUrl = `https://apis.davidcyriltech.my.id/youtube/mp3?url=${videoUrl}`;
        console.log(`Fetching MP3 from URL: ${apiUrl}`);
        const response = await axios.get(apiUrl);
        if (!response.data || !response.data.success || !response.data.result.downloadUrl) {
            return reply("Failed to fetch the audio. Try again later.");
        }

        console.log(`MP3 URL: ${response.data.result.downloadUrl}`);
        await conn.sendMessage(from, {
            audio: { url: response.data.result.downloadUrl },
            mimetype: "audio/mpeg",
            ptt: false,
            caption: `🎵 *Title:* ${response.data.result.title}\n🔗 *Link:* ${videoUrl}`
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in music command:", e);
        reply("An error occurred while processing your request.");
    }
});