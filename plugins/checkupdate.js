const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

cmd(
  {
    pattern: 'checkupdate',
    alias: ['checkupgrade', 'checksync'],
    react: '🔍',
    desc: 'Check for updates without applying them.',
    category: 'misc',
    filename: __filename,
  },
  async (
    _0x16bb3a,
    _0x28ebc3,
    _0x20184b,
    { from: _0x38ab0b, reply: _0x585e21, sender: _0x5f51fe, isOwner: _0x607c9a }
  ) => {
    if (!_0x607c9a) {
      return _0x585e21('This command is only for the bot owner.');
    }
    try {
      await _0x585e21('```🔍 Checking for KERM-MD updates...```\n');
      const { data: _0x5942d2 } = await axios.get(
        'https://api.github.com/repos/Kgtech-cmr/KERM-MD-V1/commits/main'
      );
      const _0x4d4bd0 = _0x5942d2.sha;
      const _0xauthor = _0x5942d2.commit.author.name;
      const _0xdate = new Date(_0x5942d2.commit.author.date).toLocaleString('en-US', { timeZone: 'UTC' });
      
      let _0x1ebf53 = 'unknown';
      try {
        const _0xc59331 = require('../package.json');
        _0x1ebf53 = _0xc59331.commitHash || 'unknown';
      } catch (_0x2b6884) {
        console.error('Error reading package.json:', _0x2b6884);
      }

      await _0x585e21(`Last commit: ${_0x4d4bd0}\nAuthor: ${_0xauthor}\nDate: ${_0xdate}`);

      if (_0x4d4bd0 === _0x1ebf53) {
        return _0x585e21('```✅ Your KERM-MD bot is already up-to-date!```\n');
      } else {
        return _0x585e21('```🔄 Updates are available for KERM-MD.```\n');
      }
    } catch (_0x781606) {
      console.error('Check update error:', _0x781606);
      _0x585e21('❌ Check update failed. Please try manually.');
    }
  }
);