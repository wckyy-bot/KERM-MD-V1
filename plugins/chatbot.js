const axios = require("axios");
const { cmd } = require("../command");

let chatbotEnabled = true; // Variable to track the chatbot state

// Command to turn chatbot on
cmd({
  pattern: "chatbot on",
  desc: "Turn the chatbot on",
  category: "chatbot",
  react: "✅",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  chatbotEnabled = true;
  await reply("Chatbot is now ON.");
});

// Command to turn chatbot off
cmd({
  pattern: "chatbot off",
  desc: "Turn the chatbot off",
  category: "chatbot",
  react: "❌",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  chatbotEnabled = false;
  await reply("Chatbot is now OFF.");
});

// Function to automatically respond to messages
const autoRespond = async (conn, message) => {
  if (!chatbotEnabled) return;

  const { from, text, sender } = message;

  try {
    const encodedText = encodeURIComponent(text); // Ensure the text is encoded correctly

    // List of API endpoints
    const apis = [
      `https://bk9.fun/ai/blackbox?q=${encodedText}`,
      `https://api.siputzx.my.id/api/ai/bard?query=${encodedText}`,
      `https://api.siputzx.my.id/api/ai/blackboxai-pro?content=${encodedText}`,
      `https://api.siputzx.my.id/api/ai/blackboxai?content=${encodedText}`,
      `https://vapis.my.id/api/blackbox?q=${encodedText}`,
      `https://apis.davidcyriltech.my.id/blackbox?q=${encodedText}`,
      `https://api.siputzx.my.id/api/ai/deepseek-llm-67b-chat?content=${encodedText}`,
      `https://apis.davidcyriltech.my.id/ai/deepseek-v3?text=${encodedText}`,
      `https://apis.davidcyriltech.my.id/ai/deepseek-r1?text=${encodedText}`,
      `https://api.ryzendesu.vip/api/ai/deepseek?text=${encodedText}`,
      `https://vapis.my.id/api/openai?q=${encodedText}`,
      `https://vapis.my.id/api/gpt4o?q=${encodedText}`,
      `https://lance-frank-asta.onrender.com/api/gpt?q=${encodedText}`,
      `https://api.gurusensei.workers.dev/llama?prompt=${encodedText}`,
      `https://api.ryzendesu.vip/api/ai/v2/chatgpt?text=${encodedText}`,
      `https://api.dreaded.site/api/chatgpt?text=${encodedText}`,
      `https://api.giftedtech.my.id/api/ai/gpt4?apikey=gifted&q=${encodedText}`,
      `https://api.giftedtech.my.id/api/ai/gpt4v2?apikey=gifted&q=${encodedText}`,
      `https://api.giftedtech.my.id/api/ai/gpt4-o?apikey=gifted&q=${encodedText}`,
      `https://apis.davidcyriltech.my.id/ai/metaai?text=${encodedText}`,
      `https://api.siputzx.my.id/api/ai/meta-llama-33-70B-instruct-turbo?content=${encodedText}`,
      `https://vapis.my.id/api/Ilamav2?q=${encodedText}`,
      `https://apis.davidcyriltech.my.id/ai/llama3?text=${encodedText}`
    ];

    // Helper function to fetch data from APIs
    const fetchFromApis = async (apis) => {
      for (const api of apis) {
        try {
          const response = await axios.get(api);
          if (response.data) {
            return response.data;
          }
        } catch (error) {
          console.error(`Error with API: ${api}`, error.message);
        }
      }
      return null; // Return null if no API succeeds
    };

    // Fetch data from APIs
    const response = await fetchFromApis(apis);

    if (response) {
      const replyText = response.BK9 || response.answer || response.result ||
        response.message || response.data || response.response ||
        "No specific key matched, but API returned data.";

      await conn.sendMessage(from, { text: replyText });
    } else {
      console.error('No valid response received from APIs.');
    }
  } catch (error) {
    console.error('Error fetching chatbot response:', error);
  }
};

// Event listener for incoming messages
const handleMessage = async (conn, message) => {
  // Add logic to determine if the message should be handled by the chatbot
  if (message.text && !message.isGroupMsg && message.fromMe) {
    await autoRespond(conn, message);
  }
};

// Attach the event listener to your bot's message handler
// Assuming `zk` is your bot instance
zk.on('message-new', async (message) => {
  await handleMessage(zk, message);
});