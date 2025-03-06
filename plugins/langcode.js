
// Command setup
cmd({
  pattern: "langcode",
  desc: "Display all ISO 639-1 language codes.",
  react: "🌍",
  category: "info",
  filename: __filename
}, async (bot, message, chat, { from, reply }) => {
  try {
    // Language codes list with ISO 639-1 codes and their country flags
    const languageList = `🌍 *Complete list of ISO 639-1 language codes* 🌍
━━━━━━━━━━━━━━━━━━━
🇦🇫 *Pashto* ➝ ps  
🇦🇱 *Albanian* ➝ sq 
🇩🇿 *Arabic* ➝ ar  
🇦🇲 *Armenian* ➝ hy  
🇦🇺 *English* ➝ en  
🇦🇿 *Azerbaijani* ➝ az  
🇧🇩 *Bengali* ➝ bn  
🇧🇬 *Bulgarian* ➝ bg  
🇧🇷 *Portuguese* ➝ pt  
🇨🇳 *Chinese* ➝ zh  
🇨🇿 *Czech* ➝ cs  
🇩🇪 *German* ➝ de  
🇩🇰 *Danish* ➝ da  
🇪🇸 *Spanish* ➝ es  
🇪🇪 *Estonian* ➝ et  
🇪🇺 *Basque* ➝ eu  
🇫🇷 *French* ➝ fr  
🇬🇷 *Greek* ➝ el  
🇮🇩 *Indonesian* ➝ id  
🇮🇪 *Irish* ➝ ga  
🇮🇹 *Italian* ➝ it  
🇯🇵 *Japanese* ➝ ja  
🇮🇳 *Hindi* ➝ hi  
🇰🇷 *Korean* ➝ ko  
🇱🇻 *Latvian* ➝ lv  
🇱🇹 *Lithuanian* ➝ lt  
🇲🇦 *Berber* ➝ ber  
🇲🇽 *Spanish* ➝ es  
🇳🇱 *Dutch* ➝ nl  
🇳🇴 *Norwegian* ➝ no  
🇵🇱 *Polish* ➝ pl  
🇷🇴 *Romanian* ➝ ro  
🇷🇺 *Russian* ➝ ru  
🇸🇦 *Arabic* ➝ ar  
🇸🇮 *Slovenian* ➝ sl  
🇸🇰 *Slovak* ➝ sk  
🇸🇪 *Swedish* ➝ sv  
🇹🇭 *Thai* ➝ th  
🇹🇷 *Turkish* ➝ tr  
🇺🇦 *Ukrainian* ➝ uk  
🇺🇿 *Uzbek* ➝ uz  
🇿🇦 *Afrikaans* ➝ af  
🇻🇳 *Vietnamese* ➝ vi  
━━━━━━━━━━━━━━━━━━━
✅ *Use these codes for translation and other language functions!*`;

    // Image URL representing world languages
    const imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Langues_mondiales.png/800px-Langues_mondiales.png"; 

    // Sending the message with language list and image
    await bot.sendMessage(from, {
      image: { url: imageUrl },  // Sending the image
      caption: languageList  // Sending the language list
    }, { quoted: message });

  } catch (error) {
    // Error handling
    console.log(error);  // Log the error for debugging
    reply("❌ An error occurred.");
  }
});