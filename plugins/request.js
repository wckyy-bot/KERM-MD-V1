

/*
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
*/

const { cmd } = require('../command');

// Object to track user requests: { senderId: { count: number, lastTime: timestamp } }
let userRequests = {};

cmd({
  pattern: "request",
  desc: "Send a message to the bot developers. (Max 5 requests per day)",
  category: "general",
  react: "📩",
  filename: __filename,
}, async (conn, mek, m, { sender, pushName, args, reply, react }) => {
  try {
    // Check if the user provided a message
    if (!args || args.length === 0) {
      return reply(
        "❌ *Invalid format!*\n\n➤ Usage: `.request <your message>`\n➤ Example: `.request The Play command has a problem.`"
      );
    }

    // Rate limit: maximum 5 requests per 24 hours per user
    const currentTime = Date.now();
    if (userRequests[sender]) {
      const { count, lastTime } = userRequests[sender];
      // If within 24 hours window
      if (currentTime - lastTime < 24 * 60 * 60 * 1000) {
        if (count >= 5) {
          const remainingMs = 24 * 60 * 60 * 1000 - (currentTime - lastTime);
          const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));
          return reply(
            `❌ You have reached your request limit for today. Please wait ${remainingHours} hour(s) before sending another request.`
          );
        } else {
          userRequests[sender].count++;
        }
      } else {
        // Reset after 24 hours
        userRequests[sender] = { count: 1, lastTime: currentTime };
      }
    } else {
      userRequests[sender] = { count: 1, lastTime: currentTime };
    }

    // Get current time in Cameroon (UTC+1)
    const date = new Date();
    const options = { timeZone: "Africa/Douala", hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" };
    const formattedTime = new Intl.DateTimeFormat("fr-FR", options).format(date);

    // Developer numbers
    const devNumbers = [
      "237656520674@s.whatsapp.net", // Developer 1
      "237659535227@s.whatsapp.net", // Developer 2
    ];

    // Construct the message to be sent to developers
    const userMessage = args.join(" ");
    const requestMessage =
      `*📩 NEW REQUEST RECEIVED*\n\n` +
      `👤 *User:* ${pushName || "Unknown"}\n` +
      `📞 *Number:* wa.me/${sender.split('@')[0]}\n` +
      `⏰ *Time:* ${formattedTime}\n` +
      `📝 *Message:*\n➜ _${userMessage}_\n\n` +
      `━━━━━━━━━━━━━━━`;

    // Send the request to each developer
    for (const dev of devNumbers) {
      await conn.sendMessage(dev, { text: requestMessage }).catch(() => {});
    }

    // React with the envelope icon and send the confirmation message to the user
    await react("📩");
    reply("*✅ Your request has been sent to the developers. They will check it as soon as possible.*");

  } catch (error) {
    reply(`❌ *An error occurred:*\n${error}`);
    console.error(error);
  }
});