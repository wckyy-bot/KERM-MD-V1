const fs = require('fs');
const path = require('path');
const { cmd } = require('../command');

// Chemin du fichier de stockage des numéros bannis
const bannedFilePath = path.join(__dirname, 'banned.json');

// Fonction pour charger la liste bannie
function loadBannedList() {
  if (!fs.existsSync(bannedFilePath)) {
    fs.writeFileSync(bannedFilePath, JSON.stringify([]));
    return [];
  }
  try {
    const data = fs.readFileSync(bannedFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading banned list:", err);
    return [];
  }
}

// Fonction pour sauvegarder la liste bannie
function saveBannedList(list) {
  fs.writeFileSync(bannedFilePath, JSON.stringify(list, null, 2));
}

/* COMMANDE BAN
   Permet de bannir définitivement un utilisateur du groupe.
   Usage : répondre à un message ou fournir un numéro.
*/
cmd({
  pattern: "ban",
  desc: "Ban a user permanently from the group (admin/owner only).",
  category: "admin",
  filename: __filename,
}, async (conn, mek, m, { from, isGroup, isAdmins, isOwner, reply }) => {
  try {
    if (!isGroup) return reply("❌ This command can only be used in groups.");
    if (!isAdmins && !isOwner) return reply("❌ Only group admins or the owner can use this command.");

    // Détermination de la cible : soit via une réponse, soit par argument
    let target;
    if (m.quoted) {
      target = m.quoted.sender;
    } else {
      let num = m.text.split(" ")[1];
      if (!num) return reply("❌ Please mention or provide a number to ban.");
      target = num.includes('@') ? num : num + "@s.whatsapp.net";
    }
    if (!target) return reply("❌ Unable to determine the target user.");

    // Charger la liste bannie et ajouter le numéro si ce n'est pas déjà fait
    let bannedList = loadBannedList();
    if (!bannedList.includes(target)) {
      bannedList.push(target);
      saveBannedList(bannedList);
    }

    // Retirer l'utilisateur du groupe
    await conn.groupParticipantsUpdate(from, [target], "remove").catch(err => {
      console.error(err);
      return reply("❌ Failed to remove the user from the group.");
    });
    reply(`✅ User ${target} has been banned and removed from the group permanently.`);
  } catch (error) {
    reply(`❌ An error occurred: ${error}`);
    console.error(error);
  }
});

/* COMMANDE UNBAN
   Permet de débannir un utilisateur en retirant son numéro du fichier de stockage.
   Usage : .unban <number>
*/
cmd({
  pattern: "unban",
  desc: "Unban a user from the group (admin/owner only).",
  category: "admin",
  filename: __filename,
}, async (conn, mek, m, { from, isGroup, isAdmins, isOwner, reply }) => {
  try {
    if (!isGroup) return reply("❌ This command can only be used in groups.");
    if (!isAdmins && !isOwner) return reply("❌ Only group admins or the owner can use this command.");

    let num = m.text.split(" ")[1];
    if (!num) return reply("❌ Please provide a number to unban.");
    let target = num.includes('@') ? num : num + "@s.whatsapp.net";

    let bannedList = loadBannedList();
    if (!bannedList.includes(target)) {
      return reply(`❌ The user ${target} is not banned.`);
    }
    bannedList = bannedList.filter(u => u !== target);
    saveBannedList(bannedList);
    reply(`✅ User ${target} has been unbanned.`);
  } catch (error) {
    reply(`❌ An error occurred: ${error}`);
    console.error(error);
  }
});