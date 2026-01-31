const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// ================= CLIENT =================
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: false,
  webVersionCache: {
    type: 'remote',
    remotePath:
      'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
  }
});

// ================= MEMÓRIA =================
const users = new Set();
const humanSupport = new Set();

// ================= QR CODE =================
client.on('qr', qr => {
  console.log('📲 Escaneie o QR Code abaixo:');
  qrcode.generate(qr, { small: true });
});

// ================= READY =================
client.on('ready', () => {
  console.log('🤖 Bot Bella by Julia ONLINE!');
});

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

// ================= MENSAGENS =================
client.on('message', async message => {
  const msg = message.body.trim();
  const user = message.from;

  if (user.includes('@g.us')) return;

  if (message.fromMe) {
    humanSupport.add(message.to);
    return;
  }

  if (humanSupport.has(user)) return;

  if (!isBusinessHours()) {
    return message.reply(
      '⏰ Atendimento: seg–sex, 9h às 18h.\nDeixe sua mensagem 💖'
    );
  }

  if (!users.has(user)) {
    users.add(user);
    return message.reply(menu());
  }

  switch (msg) {
    case '1':
      return message.reply(
        `✨ Sobre nós
Moda feminina com elegância e sofisticação.
https://www.bellabyjulia.com/sobre-nos

Digite 9 para voltar 🔙`
      );

    case '2':
      return message.reply(
        `🛍️ Como comprar
https://www.bellabyjulia.com/como-comprar

Digite 9 para voltar 🔙`
      );

    case '3':
      return message.reply(
        `💳 Formas de pagamento
https://www.bellabyjulia.com/formas-pagamento

Digite 9 para voltar 🔙`
      );

    case '4':
      return message.reply(
        `📦 Prazo de entrega
https://www.bellabyjulia.com/prazo-entrega

Digite 9 para voltar 🔙`
      );

    case '5':
      return message.reply(
        `🔄 Política de trocas
https://www.bellabyjulia.com/politica-troca

Digite 9 para voltar 🔙`
      );

    case '6':
      return message.reply(
        `🌐 Nosso site
https://www.bellabyjulia.com

Digite 9 para voltar 🔙`
      );

    case '9':
      return message.reply(menu());

    case '0':
      humanSupport.add(user);
      return message.reply('💬 Um atendente humano assumirá 💖');

    default:
      return;
  }
});

// ================= RECUSAR CHAMADAS =================
client.on('call', async call => {
  await call.reject();
  await client.sendMessage(
    call.from,
    '📵 Não atendemos chamadas.\nEnvie mensagem por aqui 💖'
  );
});

// ================= START =================
client.initialize();
