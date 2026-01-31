const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require('@whiskeysockets/baileys');

const qrcode = require('qrcode-terminal');
const fs = require('fs');

const users = new Set();
const humanSupport = new Set();

// ================= HORÁRIO =================
function isBusinessHours() {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  return day >= 1 && day <= 5 && hour >= 9 && hour < 18;
}

// ================= MENU =================
function menu() {
  return `
✨ *Bella by Julia* ✨
Moda feminina com elegância e sofisticação.

Digite uma opção 👇
1️⃣ Sobre nós
2️⃣ Como comprar
3️⃣ Formas de pagamento
4️⃣ Prazo de entrega
5️⃣ Política de trocas
6️⃣ Acessar o site
0️⃣ Falar com atendimento
`;
}

// ================= START =================
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  });

  sock.ev.on('creds.update', saveCreds);

  // QR CODE
  sock.ev.on('connection.update', ({ qr, connection, lastDisconnect }) => {
    if (qr) {
      console.log('📲 Escaneie o QR Code abaixo:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'open') {
      console.log('🤖 Bot Bella by Julia ONLINE!');
    }

    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;
      if (shouldReconnect) startBot();
    }
  });

  // ================= MENSAGENS =================
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const user = msg.key.remoteJid;
    if (user.includes('@g.us')) return;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      '';

    // pausa para humano
    if (humanSupport.has(user)) return;

    // fora do horário
    if (!isBusinessHours()) {
      return sock.sendMessage(user, {
        text:
          '⏰ Atendimento de segunda a sexta, das 9h às 18h.\n' +
          'Deixe sua mensagem 💖'
      });
    }

    // primeira mensagem
    if (!users.has(user)) {
      users.add(user);
      return sock.sendMessage(user, { text: menu() });
    }

    switch (text.trim()) {
      case '1':
        return sock.sendMessage(user, {
          text:
            `✨ Sobre nós\nModa feminina com elegância e sofisticação.\n` +
            `https://www.bellabyjulia.com/sobre-nos\n\nDigite 9 para voltar 🔙`
        });

      case '2':
        return sock.sendMessage(user, {
          text:
            `🛍️ Como comprar\nhttps://www.bellabyjulia.com/como-comprar\n\nDigite 9 para voltar 🔙`
        });

      case '3':
        return sock.sendMessage(user, {
          text:
            `💳 Formas de pagamento\nhttps://www.bellabyjulia.com/formas-pagamento\n\nDigite 9 para voltar 🔙`
        });

      case '4':
        return sock.sendMessage(user, {
          text:
            `📦 Prazo de entrega\nhttps://www.bellabyjulia.com/prazo-entrega\n\nDigite 9 para voltar 🔙`
        });

      case '5':
        return sock.sendMessage(user, {
          text:
            `🔄 Política de trocas\nhttps://www.bellabyjulia.com/politica-troca\n\nDigite 9 para voltar 🔙`
        });

      case '6':
        return sock.sendMessage(user, {
          text:
            `🌐 Nosso site\nhttps://www.bellabyjulia.com\n\nDigite 9 para voltar 🔙`
        });

      case '9':
        return sock.sendMessage(user, { text: menu() });

      case '0':
        humanSupport.add(user);
        return sock.sendMessage(user, {
          text: '💬 Um atendente humano assumirá o atendimento 💖'
        });

      case 'bot on':
        humanSupport.delete(user);
        return sock.sendMessage(user, {
          text: '🤖 Bot reativado com sucesso!'
        });

      default:
        return;
    }
  });
}

startBot();
