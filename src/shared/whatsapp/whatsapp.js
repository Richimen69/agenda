import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';

let isClientReady = false;
let client = null;

// Evita loops infinitos de reinicio si el problema es persistente
// (ej. versión de WhatsApp Web incompatible) en vez de fallar en bucle.
let restartAttempts = 0;
const MAX_RESTART_ATTEMPTS = 5;
const RESTART_BASE_DELAY_MS = 5000; // backoff exponencial: 5s, 10s, 20s, 40s...

const inicializarWhatsApp = () => {
  console.log('[WhatsApp] Iniciando una nueva instancia del cliente...');

  client = new Client({
    authStrategy: new LocalAuth(),
    // FIX PRINCIPAL: sin esto, whatsapp-web.js usa una versión cacheada
    // del bundle de WhatsApp Web que puede no coincidir con la actual,
    // causando el "Execution context was destroyed" en la inyección.
    webVersionCache: {
      type: 'remote',
      remotePath:
        'https://raw.githubusercontent.com/wwebjs/wwebjs.dev/main/html/2.3000.1023917366-alpha.html',
    },
    puppeteer: {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
      ],
    },
  });

  client.on('qr', (qr) => {
    console.log('\n[WhatsApp] Escanea este código QR para iniciar sesión:');
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', () => {
    console.log('[WhatsApp] Cliente conectado y listo para enviar mensajes!');
    isClientReady = true;
    restartAttempts = 0; // se conectó bien, reseteamos el contador de reintentos
  });

  client.on('auth_failure', (msg) => {
    console.error('[WhatsApp] Error de autenticación:', msg);
    isClientReady = false;
  });

  client.on('disconnected', async (reason) => {
    console.log('[WhatsApp] Cliente desconectado. Razón:', reason);
    isClientReady = false;

    console.log('[WhatsApp] Limpiando la instancia dañada...');
    try {
      await client.destroy();
      console.log('[WhatsApp] Instancia antigua destruida con éxito.');
    } catch (err) {
      console.error('[WhatsApp] Error al destruir el cliente viejo:', err);
    }

    scheduleRestart();
  });

  // FIX PRINCIPAL: capturar el error de initialize() para que no tumbe
  // el proceso completo. Antes esto no tenía .catch() y por eso el
  // ProtocolError mataba el servidor entero en vez de solo el cliente WA.
  client.initialize().catch((err) => {
    console.error('[WhatsApp] Error al inicializar el cliente:', err.message);
    isClientReady = false;
    scheduleRestart();
  });
};

function scheduleRestart() {
  if (restartAttempts >= MAX_RESTART_ATTEMPTS) {
    console.error(
      `[WhatsApp] Se alcanzó el máximo de ${MAX_RESTART_ATTEMPTS} reintentos. ` +
        'No se reintentará automáticamente. Revisa la versión de whatsapp-web.js ' +
        'o borra la carpeta .wwebjs_auth antes de reiniciar manualmente.',
    );
    return;
  }

  const delay = RESTART_BASE_DELAY_MS * Math.pow(2, restartAttempts);
  restartAttempts += 1;
  console.log(
    `[WhatsApp] Reintentando en ${delay / 1000}s (intento ${restartAttempts}/${MAX_RESTART_ATTEMPTS})...`,
  );

  setTimeout(() => {
    inicializarWhatsApp();
  }, delay);
}

inicializarWhatsApp();

export const sendWhatsAppMessage = async (phone, message) => {
  if (!isClientReady || !client) {
    throw new Error('El cliente de WhatsApp no está listo o se encuentra desconectado.');
  }

  try {
    const chatId = `${phone}@c.us`;
    const response = await client.sendMessage(chatId, message);
    return response;
  } catch (error) {
    console.error(`[WhatsApp] Error al enviar mensaje a ${phone}:`, error);
    throw error;
  }
};

export const detenerWhatsApp = async () => {
  if (client) {
    console.log('[WhatsApp] Apagando el cliente y cerrando navegador...');
    try {
      await client.destroy();
      client = null;
      isClientReady = false;
      restartAttempts = 0;
      console.log('[WhatsApp] Bot completamente apagado.');
    } catch (error) {
      console.error('[WhatsApp] Error al intentar apagar el cliente:', error);
    }
  } else {
    console.log('[WhatsApp] El bot ya estaba apagado.');
  }
};

export const getStatusWhatsApp = () => {
  return {
    activo: client !== null,
    listoParaEnviar: isClientReady,
  };
};

export const encenderWhatsApp = () => {
  if (!client) {
    restartAttempts = 0;
    inicializarWhatsApp();
  } else {
    console.log('[WhatsApp] El bot ya está encendido o iniciándose.');
  }
};