/*
_  ______   _____ _____ _____ _   _
| |/ / ___| |_   _| ____/___ | | | |
| ' / |  _    | | |  _|| |   | |_| |
| . \ |_| |   | | | |__| |___|  _  |
|_|\_\____|   |_| |_____\____|_| |_|

ANYWAY, YOU MUST GIVE CREDIT TO MY CODE WHEN COPY IT
CONTACT ME HERE +237656520674
YT: KermHackTools
Github: Kgtech-cmr
*/

const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

cmd(
  {
    pattern: 'update',
    alias: ['upgrade', 'sync'],
    react: '🆕',
    desc: 'Update the bot to the latest version.',
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
      let _0x1ebf53 = 'unknown';
      try {
        const _0xc59331 = require('../package.json');
        _0x1ebf53 = _0xc59331.commitHash || 'unknown';
      } catch (_0x2b6884) {
        console.error('Error reading package.json:', _0x2b6884);
      }
      if (_0x4d4bd0 === _0x1ebf53) {
        return _0x585e21('```✅ Your KERM-MD bot is already up-to-date!```\n');
      }
      await _0x585e21('```Kerm Md Bot Updating...🚀```\n');
      const _0x127dfd = path.join(__dirname, 'latest.zip'),
        { data: _0x50a220 } = await axios.get(
          'https://github.com/Kgtech-cmr/KERM-MD-V1/archive/main.zip',
          { responseType: 'arraybuffer' }
        );
      fs.writeFileSync(_0x127dfd, _0x50a220);
      await _0x585e21('```📦 Extracting the latest code...```\n');
      const _0xb0cd5 = path.join(__dirname, 'latest'),
        _0x395f72 = new AdmZip(_0x127dfd);
      _0x395f72.extractAllTo(_0xb0cd5, true);
      await _0x585e21('```🔄 Replacing files...```\n');
      const _0x5839a6 = path.join(_0xb0cd5, 'KERM-MD-V1-main'),
        _0x120a2d = path.join(__dirname, '..');
      copyFolderSync(_0x5839a6, _0x120a2d);
      fs.unlinkSync(_0x127dfd);
      fs.rmSync(_0xb0cd5, {
        recursive: true,
        force: true,
      });
      // Mettre à jour le hash du commit dans package.json
      const packagePath = path.join(__dirname, '../package.json');
      const packageData = require(packagePath);
      packageData.commitHash = _0x4d4bd0;
      fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2));
      await _0x585e21('```🔄 Restarting the bot to apply updates...```\n');
      process.exit(0);
    } catch (_0x781606) {
      console.error('Update error:', _0x781606);
      _0x585e21('❌ Update failed. Please try manually.');
    }
  }
);

function copyFolderSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src);
  for (const entry of entries) {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);
    if (entry === 'config.js' || entry === 'app.json') {
      console.log('Skipping ' + entry + ' to preserve custom settings.');
      continue;
    }
    if (fs.lstatSync(srcPath).isDirectory()) {
      copyFolderSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}