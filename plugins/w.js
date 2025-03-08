const config = require('../config');
const { cmd } = require('../command');
const { ytsearch, ytmp3, ytmp4 } = require('@dark-yasiya/yt-dl.js'); 

// video

cmd({
    pattern: "mp5",
    alias: ["yta", "play"],
    react: "🎶",
    desc: "Download Youtube song",
    category: "main",
    use: '.song < Yt url or Name >',
    filename: __filename
}, async (conn, mek, m, { from, prefix, quoted, q, reply }) => {
    try {
        if (!q) return await reply("*𝐏ℓєαʂє 𝐏ɼ๏νιɖє 𝐀 𝐘ʈ 𝐔ɼℓ ๏ɼ 𝐒๏ƞ͛g 𝐍αмє..*");

        // Start fetching the search results and audio download URL in parallel
        const [ytResult, audioResponse] = await Promise.all([
            ytsearch(q),
            fetch(`https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(q)}`)
        ]);

        if (ytResult.results.length < 1) return reply("No results found!");

        let yts = ytResult.results[0];
        let data = await audioResponse.json();

        if (data.status !== 200 || !data.success || !data.result.downloadUrl) {
            return reply("Failed to fetch the audio. Please try again later.");
        }

        let ytmsg = `╔═══〔 *𝐊𝐄𝐑𝐌 𝐌𝐃 𝐕𝟏* 〕═══❒
║╭───────────────◆  
║│ *𝐊𝐄𝐑𝐌 𝐌Ɗ 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐈𝐍𝐆*
║╰───────────────◆
╚══════════════════❒
╔══════════════════❒
║ ⿻ *ᴛɪᴛʟᴇ:*  ${yts.title}
║ ⿻ *ᴅᴜʀᴀᴛɪᴏɴ:*  ${yts.timestamp}
║ ⿻ *ᴠɪᴇᴡs:*  ${yts.views}
║ ⿻ *ᴀᴜᴛʜᴏʀ:*  ${yts.author.name}
║ ⿻ *ʟɪɴᴋ:*  ${yts.url}
╚══════════════════❒
*ғꪮʀ ʏꪮꪊ ғꪮʀ ᴀʟʟ ꪮғ ᴀꜱ 🍉*`;

        // Send song details and audio in parallel
        await Promise.all([
            conn.sendMessage(from, { image: { url: data.result.image || '' }, caption: ytmsg }, { quoted: mek }),
            conn.sendMessage(from, { audio: { url: data.result.downloadUrl }, mimetype: "audio/mpeg" }, { quoted: mek })
        ]);

        // Optionally send document file
        await conn.sendMessage(from, {
            document: { url: data.result.downloadUrl },
            mimetype: "audio/mpeg",
            fileName: `${data.result.title}.mp3`,
            caption: `> *© 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 ʙʏ 𝐊𝐞𝐫𝐦 𝐦𝐝🎐*`
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("An error occurred. Please try again later.");
    }
});