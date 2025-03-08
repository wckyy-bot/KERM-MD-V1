

cmd({
    pattern: "mp3",
    alias: ["yta", "play"],
    react: "🎶",
    desc: "Download Youtube song",
    category: "main",
    use: '.song < Yt url or Name >',
    filename: __filename
}, async (conn, mek, m, { from, prefix, quoted, q, reply }) => {
    try {
        if (!q) return await reply("*𝐏ℓєαʂє 𝐏ɼ๏νιɖє 𝐀 𝐘ʈ 𝐔ɼℓ ๏ɼ 𝐒๏ƞ͛g 𝐍αмє..*");

        const yt = await ytsearch(q);
        if (yt.results.length < 1) return reply("No results found!");

        let yts = yt.results[0];
        let apiUrl = `https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(yts.url)}`;

        let response = await fetch(apiUrl);
        let data = await response.json();

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

        // Send song details
        await conn.sendMessage(from, { image: { url: data.result.image || '' }, caption: ytmsg }, { quoted: mek });

        // Send audio file
        await conn.sendMessage(from, { audio: { url: data.result.downloadUrl }, mimetype: "audio/mpeg" }, { quoted: mek });

        // Send document file
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