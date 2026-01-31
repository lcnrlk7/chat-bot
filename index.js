const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// ================= CLIENT =================
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: false, // 🚨 ISSO RESOLVE O ERRO DO CHROME
  webVersionCache: {
    type: 'remote',
    remotePath:
      'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
  }
});


// ================= MEMÓRIA =================
const users = new Set();        // menu já enviado
const humanSupport = new Set(); // atendimento humano ativo

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
  const day = now.getDay(); // 0 domingo
  const hour = now.getHours();

  const isWeekday = day >= 1 && day <= 5;
  const isWorkingHour = hour >= 9 && hour < 18;

  return isWeekday && isWorkingHour;
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

  // ignora grupos
  if (user.includes('@g.us')) return;

  // humano assumiu atendimento
  if (message.fromMe) {
    humanSupport.add(message.to);
    return;
  }

  // bot pausado para este cliente
  if (humanSupport.has(user)) return;

  // fora do horário
  if (!isBusinessHours()) {
    return message.reply(
      '⏰ Nosso atendimento funciona de segunda a sexta, das 9h às 18h.\n' +
      'Deixe sua mensagem que responderemos assim que possível 💖'
    );
  }

  // primeira mensagem
  if (!users.has(user)) {
    users.add(user);
    return message.reply(menu());
  }

  switch (msg) {
    case '1':
      return message.reply(
`✨ *Sobre nós*
Moda feminina com elegância e sofisticação.
Vestidos e peças exclusivas para todas as ocasiões.

🔗 https://www.bellabyjulia.com/sobre-nos

Digite 9 para voltar 🔙`
      );

    case '2':
      return message.reply(
`🛍️ *Como comprar*
Escolha seus produtos, finalize o pagamento e receba em casa 💖

🔗 https://www.bellabyjulia.com/como-comprar

Digite 9 para voltar 🔙`
      );

    case '3':
      return message.reply(
`💳 *Formas de pagamento*
Pix, cartão de crédito e boleto.

🔗 https://www.bellabyjulia.com/formas-pagamento

Digite 9 para voltar 🔙`
      );

    case '4':
      return message.reply(
`📦 *Prazo de entrega*
Envio pelos Correios com rastreio.

🔗 https://www.bellabyjulia.com/prazo-entrega

Digite 9 para voltar 🔙`
      );

    case '5':
      return message.reply(
`🔄 *Política de trocas*
Confira nossa política completa:

🔗 https://www.bellabyjulia.com/politica-troca

Digite 9 para voltar 🔙`
      );

    case '6':
      return message.reply(
`🌐 *Nossa loja online*
https://www.bellabyjulia.com

Digite 9 para voltar 🔙`
      );

    case '9':
      return message.reply(menu());

    case '0':
      humanSupport.add(user);
      return message.reply('💬 Um atendente assumirá o atendimento 💖');

    case 'bot on':
      humanSupport.delete(user);
      return message.reply('🤖 Bot reativado com sucesso!');

    default:
      return;
  }
});

// ================= RECUSAR CHAMADAS =================
client.on('call', async call => {
  await call.reject();
  await client.sendMessage(
    call.from,
    '📵 Não atendemos chamadas.\nPor favor, envie uma mensagem 💖'
  );
});

// ================= START =================
client.initialize();
