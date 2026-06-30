import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';

// 1. Añadimos un "bandera" para saber el estado real del cliente
let isClientReady = false;

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    // 2. Ampliamos los argumentos para darle máxima estabilidad a Puppeteer
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage', // Vital si usas Docker o Linux
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  }
});

client.on('qr', (qr) => {
  console.log('\n[WhatsApp] Escanea este codigo QR para iniciar sesion:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('[WhatsApp] Cliente conectado y listo para enviar mensajes!');
  isClientReady = true; // El bot está listo para trabajar
});

client.on('auth_failure', (msg) => {
  console.error('[WhatsApp] Error de autenticacion:', msg);
  isClientReady = false;
});

// 3. Agregamos el evento de autorecuperación
client.on('disconnected', (reason) => {
  console.log('[WhatsApp] Cliente desconectado. Razón:', reason);
  isClientReady = false; // Bloqueamos nuevos envíos
  
  console.log('[WhatsApp] Reiniciando el cliente para recuperar la sesión...');
  // Destruimos la instancia dañada y la volvemos a levantar
  client.destroy().then(() => {
    client.initialize();
  }).catch(err => console.error('[WhatsApp] Error al destruir el cliente:', err));
});

// Iniciamos el cliente
client.initialize();

export const sendWhatsAppMessage = async (phone, message) => {
  // 4. Verificamos que el cliente esté vivo antes de interactuar con Puppeteer
  if (!isClientReady) {
    throw new Error('El cliente de WhatsApp no está listo o se encuentra desconectado.');
  }

  try {
    const chatId = `${phone}@c.us`;
    const response = await client.sendMessage(chatId, message);
    return response;
  } catch (error) {
    console.error(`[WhatsApp] Error al enviar mensaje a ${phone}:`, error);
    // Lanzar el error es correcto para que BullMQ lo marque como "Failed" y aplique reintentos
    throw error;
  }
};