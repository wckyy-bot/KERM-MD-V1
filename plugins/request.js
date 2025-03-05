


const { cmd } = require('../command');

cmd(
    {
        pattern: "request",
        alias: ["req"],
        desc: "Send a message to the bot developers.",
        category: "general",
        react: "⏳",
        filename: __filename,
    },
    async (conn, mek, m, { sender, args, pushName, reply, react }) => {
        try {
            // Check if the user provided a message
            if (!args || args.length === 0) {
                return reply("❌ Please provide a message. Example: `.request The Play command has a problem.`");
            }

            // Developer numbers
            const devNumbers = [
                "237656520674@s.whatsapp.net", // Developer 1
                "237650564445@s.whatsapp.net", // Developer 2
            ];

            // Get current date and time
            const date = new Date();
            const hours = date.getHours().toString().padStart(2, "0");
            const minutes = date.getMinutes().toString().padStart(2, "0");
            const formattedTime = `${hours}:${minutes}`;

            // Construct the request message
            const userMessage = args.join(" ");
            const requestMessage = `*📩 NEW REQUEST RECEIVED*\n\n` +
                `👤 *User:* ${pushName || "Unknown"}\n` +
                `📞 *Number:* wa.me/${sender.split('@')[0]}\n` +
                `⏰ *Time:* ${formattedTime}\n` +
                `📝 *Message:*\n➜ _${userMessage}_\n\n` +
                `━━━━━━━━━━━━━━━`;

            // Send the request to both developers
            for (const dev of devNumbers) {
                await conn.sendMessage(dev, { text: requestMessage }).catch(() => {});
            }

            // React with ⏳ and remove it after 3 seconds
            await react("⏳");
            setTimeout(async () => {
                await react("");
            }, 3000);

            // Confirm to the user that the request was sent
            reply("✅ *Your request has been sent to the developers. They will check it as soon as possible.*");
        } catch (error) {
            // No error message is sent, the user can retry if necessary
        }
    }
);