import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';

// 1. Mantenemos la bandera de estado
let isClientReady = false;
let client = null; // Dejamos la variable mutable para poder reasignarla

// 2. Envolvemos la inicialización en una función reutilizable
const inicializarWhatsApp = () => {
  console.log('[WhatsApp] Iniciando una nueva instancia del cliente...');

  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    }
  });

  client.on('qr', (qr) => {
    console.log('\n[WhatsApp] Escanea este código QR para iniciar sesión:');
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', () => {
    console.log('[WhatsApp] Cliente conectado y listo para enviar mensajes!');
    isClientReady = true;
  });

  client.on('auth_failure', (msg) => {
    console.error('[WhatsApp] Error de autenticación:', msg);
    isClientReady = false;
  });

  // 3. Autorecuperación real destruyendo y creando una NUEVA instancia
  client.on('disconnected', async (reason) => {
    console.log('[WhatsApp] Cliente desconectado. Razón:', reason);
    isClientReady = false; 
    
    console.log('[WhatsApp] Limpiando la instancia dañada...');
    try {
      await client.destroy();
      console.log('[WhatsApp] Instancia antigua destruida con éxito. Reiniciando...');
      inicializarWhatsApp(); // <- Aquí llamamos a la función para crear un cliente nuevo
    } catch (err) {
      console.error('[WhatsApp] Error crítico al destruir el cliente viejo:', err);
    }
  });

  client.initialize();
};

// Arrancamos el servicio por primera vez
inicializarWhatsApp();

// 4. Tu función de envío de mensajes queda intacta
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


// Función para apagar el bot por completo
export const detenerWhatsApp = async () => {
  if (client) {
    console.log('[WhatsApp] Apagando el cliente y cerrando navegador...');
    try {
      await client.destroy();
      client = null;
      isClientReady = false;
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
    listoParaEnviar: isClientReady
  };
};

// Función para volver a encenderlo cuando quieras
export const encenderWhatsApp = () => {
  if (!client) {
    inicializarWhatsApp();
  } else {
    console.log('[WhatsApp] El bot ya está encendido o iniciándose.');
  }
};

