const axios = require('axios');
const { cmd } = require('../command');

const BASE_URL = 'https://www.guerrillamail.com/ajax.php';
let userSessions = {};

// Commande .tempmail
cmd(
  {
    pattern: 'tempmail',
    react: '📧',
    alias: ['tm', 'mailtemp'],
    desc: 'Générer et consulter des e-mails temporaires.',
    category: 'utility',
    use: '.tempmail [new | inbox | read <ID>]',
    filename: __filename,
  },
  async (bot, message, senderInfo, { from, args, reply }) => {
    try {
      const action = args[0] ? args[0].toLowerCase() : 'new';

      // Générer un nouvel e-mail temporaire
      if (action === 'new') {
        const response = await axios.get(`${BASE_URL}?f=get_email_address`, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
        });

        const { email_addr, sid_token } = response.data;
        userSessions[from] = { email: email_addr, sid_token };

        const replyText = `📩 *Votre e-mail temporaire :* ${email_addr}\n\nUtilisez .tempmail inbox pour voir les e-mails reçus.`;

        await bot.sendMessage(from, { text: replyText }, { quoted: message });
        return;
      }

      // Vérifier si l'utilisateur a une session active
      if (!userSessions[from]) {
        return reply("❌ Vous n'avez pas d'e-mail temporaire actif. Utilisez `.tempmail new` pour en générer un.");
      }

      const { email, sid_token } = userSessions[from];

      // Vérifier la boîte de réception
      if (action === 'inbox') {
        const response = await axios.get(`${BASE_URL}?f=get_email_list&sid_token=${sid_token}&offset=0`, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
        });

        const emails = response.data.list;

        if (!emails || emails.length === 0) {
          return reply('📭 Aucun e-mail reçu dans votre boîte temporaire.');
        }

        let inboxText = '📬 *Messages reçus :*\n\n';
        emails.forEach(email => {
          inboxText += `🔢 ID : ${email.mail_id}\n📧 De : ${email.mail_from}\n📌 Sujet : ${email.mail_subject}\n\n`;
        });

        inboxText += 'Utilisez `.tempmail read <ID>` pour lire un e-mail.';
        await bot.sendMessage(from, { text: inboxText }, { quoted: message });
        return;
      }

      // Lire un e-mail spécifique
      if (action === 'read') {
        const emailID = args[1];
        if (!emailID) {
          return reply("❌ Fournissez un ID d'e-mail. Exemple : `.tempmail read 12345`");
        }

        const response = await axios.get(`${BASE_URL}?f=fetch_email&sid_token=${sid_token}&email_id=${emailID}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
        });

        const emailData = response.data;

        if (!emailData || !emailData.mail_subject) {
          return reply("❌ ID d'e-mail invalide ou e-mail inexistant.");
        }

        const emailText = `📧 *De :* ${emailData.mail_from}\n📌 *Sujet :* ${emailData.mail_subject}\n📩 *Message :*\n${emailData.mail_body}`;

        await bot.sendMessage(from, { text: emailText }, { quoted: message });
        return;
      }

      // Option invalide
      return reply("❌ Option invalide. Utilisez `.tempmail new`, `.tempmail inbox`, ou `.tempmail read <ID>`");
      
    } catch (error) {
      console.error('Erreur avec temp mail:', error);
      reply('❌ Échec du traitement. Réessayez plus tard.');
    }
  }
);