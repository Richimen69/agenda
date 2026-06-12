import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';

// Inicializamos el cliente con LocalAuth para guardar la sesion
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', (qr) => {
  console.log('\n[WhatsApp] Escanea este codigo QR para iniciar sesion:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('[WhatsApp] Cliente conectado y listo para enviar mensajes!');
});

client.on('auth_failure', (msg) => {
  console.error('[WhatsApp] Error de autenticacion:', msg);
});

// Iniciamos el cliente
client.initialize();

// Funcion exportable para enviar mensajes
export const sendWhatsAppMessage = async (phone, message) => {
  try {
    // whatsapp-web.js requiere que el numero termine en @c.us
    const chatId = `${phone}@c.us`;
    const response = await client.sendMessage(chatId, message);
    return response;
  } catch (error) {
    console.error(`[WhatsApp] Error al enviar mensaje a ${phone}:`, error);
    throw error;
  }
};