const { cmd } = require("../command");
const fetch = require("node-fetch");

// Fonction principale de fetch
const fetchContent = async (url, client, m) => {
    try {
        const response = await fetch(url);
        const contentType = response.headers.get('content-type');

        if (!contentType) {
            return m.reply("The server did not return a content-type.");
        }

        console.log("Content-Type:", contentType);

        if (contentType.includes('application/json')) {
            const data = await response.json();
            return m.reply(JSON.stringify(data, null, 2));
        }

        if (contentType.includes('text/html')) {
            const html = await response.text();
            return m.reply(html);
        }

        if (contentType.includes('image')) {
            const imageBuffer = await response.buffer();
            return client.sendMessage(
                m.chat,
                { image: imageBuffer, caption: url },
                { quoted: m }
            );
        }

        if (contentType.includes('video')) {
            const videoBuffer = await response.buffer();
            return client.sendMessage(
                m.chat,
                { video: videoBuffer, caption: url },
                { quoted: m }
            );
        }

        if (contentType.includes('audio')) {
            const audioBuffer = await response.buffer();
            const filename = url.split('/').pop();
            return client.sendMessage(
                m.chat,
                {
                    audio: { url: url },
                    mimetype: "audio/mpeg",
                    fileName: filename,
                },
                { quoted: m }
            );
        }

        if (contentType.includes('application/pdf')) {
            return client.sendMessage(
                m.chat,
                {
                    document: { url: url },
                    mimetype: "application/pdf",
                    fileName: url.split('/').pop(),
                },
                { quoted: m }
            );
        }

        if (contentType.includes('application')) {
            return client.sendMessage(
                m.chat,
                {
                    document: { url: url },
                    mimetype: contentType,
                    fileName: url.split('/').pop(),
                },
                { quoted: m }
            );
        }

        return m.reply("The content type is unsupported or could not be determined.");
    } catch (error) {
        console.error(error);
        return m.reply("An error occurred while fetching the URL.");
    }
};

// Commande pour fetch
cmd({
    pattern: 'fetch',
    desc: 'Fetch content from a provided URL.',
    category: 'utility',
    react: '🌐',
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    if (!q) return reply("Provide a valid URL to fetch!");
    await fetchContent(q, conn, m);
});