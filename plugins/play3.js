

const {
  cmd,
  commands
} = require("../command");
const yts = require("yt-search");
const {
  fetchJson
} = require("../lib/functions");
const axios = require('axios');
async function ytmp4(_0x32b019, _0x339734) {
  try {
    if (!_0x32b019 || !_0x339734) {
      throw new Error("url and format parameters are required.");
    }
    const _0xd702fb = parseInt(_0x339734.replace('p', ''), 0xa);
    const _0x3cc703 = {
      'button': 0x1,
      'start': 0x1,
      'end': 0x1,
      'format': _0xd702fb,
      'url': _0x32b019
    };
    const _0x5a1205 = {
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
    const _0x4ee39c = await axios.get('https://ab.cococococ.com/ajax/download.php', {
      'params': _0x3cc703,
      'headers': _0x5a1205
    });
    const _0x2d1163 = _0x4ee39c.data.id;
    const _0x137113 = async () => {
      const _0xab25fa = {
        'id': _0x2d1163
      };
      try {
        const _0xeafb6b = await axios.get("https://p.oceansaver.in/ajax/progress.php", {
          'params': _0xab25fa,
          'headers': _0x5a1205
        });
        const {
          progress: _0x48ee9e,
          download_url: _0xd7e658,
          text: _0x245ada
        } = _0xeafb6b.data;
        return _0x245ada === "Finished" ? _0xd7e658 : (await new Promise(_0x485c8a => setTimeout(_0x485c8a, 0x3e8)), _0x137113());
      } catch (_0x27cb21) {
        throw new Error("Error in progress check: " + _0x27cb21.message);
      }
    };
    return await _0x137113();
  } catch (_0x1503ed) {
    console.error("Error:", _0x1503ed);
    return {
      'error': _0x1503ed.message
    };
  }
}
module.exports = {
  'ytmp4': ytmp4
};
function extractYouTubeId(_0x46641b) {
  const _0x4d2333 = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|playlist\?list=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const _0x4136c6 = _0x46641b.match(_0x4d2333);
  return _0x4136c6 ? _0x4136c6[0x1] : null;
}
function convertYouTubeLink(_0x584404) {
  const _0x58dae8 = extractYouTubeId(_0x584404);
  if (_0x58dae8) {
    return "https://www.youtube.com/watch?v=" + _0x58dae8;
  }
  return _0x584404;
}

cmd({
  'pattern': "play3",
  'desc': "To download songs.",
  'react': '☃️',
  'category': "download",
  'filename': __filename
}, async (_0x5351f6, _0x1439a7, _0x278458, {
  from: _0x14fac3,
  quoted: _0x2b9c51,
  body: _0x5daecf,
  isCmd: _0x34876e,
  command: _0x536863,
  args: _0x59cb59,
  q: _0x380df9,
  isGroup: _0x370f61,
  sender: _0x34a112,
  senderNumber: _0x291f83,
  botNumber2: _0x5af75e,
  botNumber: _0x1870b0,
  pushname: _0x5d0cea,
  isMe: _0x3c0b23,
  isOwner: _0x341bbe,
  groupMetadata: _0x44abd4,
  groupName: _0x5de46d,
  participants: _0x34f227,
  groupAdmins: _0x548f13,
  isBotAdmins: _0x9fa565,
  isAdmins: _0x127641,
  reply: _0x233cc6
}) => {
  try {
    if (!_0x380df9) {
      return _0x233cc6("Please give me a URL or title.");
    }
    _0x380df9 = convertYouTubeLink(_0x380df9);
    const _0x54cf3a = await yts(_0x380df9);
    const _0x20e1e8 = _0x54cf3a.videos[0];
    const _0x5ed25e = _0x20e1e8.url;
    const _0x166c67 = await _0x5351f6.sendMessage(_0x14fac3, {
      image: { url: _0x20e1e8.thumbnail },
      caption: `🎶 *𝖪𝖤𝖱𝖬-𝖬𝖣－𝖵1* 🎶\n━━━━━━━━━━━━━━━━━\n*⟣ Kᴇʀᴍ Sᴏɴɢ Dᴏᴡɴʟᴏᴀᴅᴇʀ ⟢*\n━━━━━━━━━━━━━━━━━\n\n*Title:* ${_0x20e1e8.title}\n*Duration:* ${_0x20e1e8.timestamp}`,
      quoted: _0x1439a7
    });
    const _0x164ac6 = _0x166c67.key.id;
    _0x5351f6.ev.on("messages.upsert", async _0x11c496 => {
      const _0x25ddf5 = _0x11c496.messages[0];
      if (!_0x25ddf5.message) {
        return;
      }
      const _0x5f20ab = _0x25ddf5.message.conversation || _0x25ddf5.message.extendedTextMessage?.text;
      const _0x3277a3 = _0x25ddf5.key.remoteJid;
      const _0x3cf2a8 = _0x25ddf5.message.extendedTextMessage && _0x25ddf5.message.extendedTextMessage.contextInfo.stanzaId === _0x164ac6;
      if (_0x3cf2a8) {
        await _0x5351f6.sendMessage(_0x3277a3, {
          react: { text: '⬇️', key: _0x25ddf5.key }
        });
        const _0x1cc9d0 = await fetchJson(`https://api.ryzendesu.vip/api/downloader/ytmp3?url=${_0x5ed25e}`);
        const _0x5741ec = _0x1cc9d0.result.download_url;
        await _0x5351f6.sendMessage(_0x3277a3, {
          delete: _0x166c67.key
        });
        await _0x5351f6.sendMessage(_0x3277a3, {
          react: { text: '⬆️', key: _0x25ddf5.key }
        });
        if (_0x5f20ab === '1') {
          await _0x5351f6.sendMessage(_0x3277a3, {
            audio: { url: _0x5741ec },
            mimetype: "audio/mpeg",
            contextInfo: {
              externalAdReply: {
                title: _0x20e1e8.title,
                body: _0x20e1e8.videoId,
                mediaType: 1,
                sourceUrl: _0x20e1e8.url,
                thumbnailUrl: _0x20e1e8.thumbnail,
                renderLargerThumbnail: true,
                showAdAttribution: true
              }
            }
          }, { quoted: _0x25ddf5 });
          await _0x5351f6.sendMessage(_0x3277a3, {
            react: { text: '✅', key: _0x25ddf5.key }
          });
        } else if (_0x5f20ab === '2') {
          await _0x5351f6.sendMessage(_0x3277a3, {
            document: { url: _0x5741ec },
            mimetype: "audio/mp3",
            fileName: `${_0x20e1e8.title}.mp3`,
            caption: "\n> *© Generated for you by Kerm MD V1 ❤️*\n"
          }, { quoted: _0x25ddf5 });
          await _0x5351f6.sendMessage(_0x3277a3, {
            react: { text: '✅', key: _0x25ddf5.key }
          });
        }
      }
    });
  } catch (_0x3c31c1) {
    console.log(_0x3c31c1);
    _0x233cc6('' + _0x3c31c1);
  }
});