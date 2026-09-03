import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import qrcode from "qrcode-terminal";

let isClientReady = false;
let client = null;

// Evita loops infinitos de reinicio si el problema es persistente
// (ej. versión de WhatsApp Web incompatible) en vez de fallar en bucle.
let restartAttempts = 0;
const MAX_RESTART_ATTEMPTS = 5;
const RESTART_BASE_DELAY_MS = 5000; // backoff exponencial: 5s, 10s, 20s, 40s...

const inicializarWhatsApp = () => {
  console.log("[WhatsApp] Iniciando una nueva instancia del cliente...");

  client = new Client({
    authStrategy: new LocalAuth(),
    // FIX PRINCIPAL: sin esto, whatsapp-web.js usa una versión cacheada
    // del bundle de WhatsApp Web que puede no coincidir con la actual,
    // causando el "Execution context was destroyed" en la inyección.
    webVersionCache: {
      type: "remote",
      remotePath:
        "https://raw.githubusercontent.com/wwebjs/wwebjs.dev/main/html/2.3000.1023917366-alpha.html",
    },
    puppeteer: {
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
      ],
    },
  });

  client.on("qr", (qr) => {
    console.log("\n[WhatsApp] Escanea este código QR para iniciar sesión:");
    qrcode.generate(qr, { small: true });
  });

  client.on("ready", () => {
    console.log("[WhatsApp] Cliente conectado y listo para enviar mensajes!");
    isClientReady = true;
    restartAttempts = 0; // se conectó bien, reseteamos el contador de reintentos
  });

  client.on("auth_failure", (msg) => {
    console.error("[WhatsApp] Error de autenticación:", msg);
    isClientReady = false;
  });

  client.on("disconnected", async (reason) => {
    console.log("[WhatsApp] Cliente desconectado. Razón:", reason);
    isClientReady = false;

    console.log("[WhatsApp] Limpiando la instancia dañada...");
    try {
      await client.destroy();
      console.log("[WhatsApp] Instancia antigua destruida con éxito.");
    } catch (err) {
      console.error("[WhatsApp] Error al destruir el cliente viejo:", err);
    }

    scheduleRestart();
  });
  client.on("message", async (msg) => {
    try {
      // 1. Ignorar mensajes de grupos o estados
      if (msg.from === "status@broadcast" || msg.from.includes("@g.us")) return;

      const phone = msg.from.replace("@c.us", "");
      const text = msg.body;

      // 3. Buscar si el número pertenece a un usuario registrado
      const user = await prisma.user.findFirst({
        where: { whatsappPhone: phone },
      });

      if (!user) return; // Si no es un usuario del sistema, ignoramos

      // 4. Buscar si el usuario tiene un ticket de soporte ACTIVO
      const activeTicket = await prisma.supportTicket.findFirst({
        where: {
          creatorId: user.id,
          status: { in: ["ABIERTO", "EN_PROGRESO", "ESPERANDO_USUARIO"] },
          whatsappThreadActive: true,
        },
        orderBy: { createdAt: "desc" },
      });

      if (activeTicket) {
        console.log(
          `[WhatsApp] Mensaje recibido de ${user.name} para el Ticket #${activeTicket.folio}`,
        );

        // 5. Guardar el mensaje como un comentario en el ticket
        await prisma.$transaction(async (tx) => {
          await tx.supportComment.create({
            data: {
              text: text,
              supportTicketId: activeTicket.id,
              authorId: user.id,
              isFromWhatsApp: true,
              whatsappMessageId: msg.id.id, // Guardamos el ID del mensaje para evitar duplicados
            },
          });

          // 6. Si el técnico estaba esperando respuesta, regresamos el ticket a EN_PROGRESO
          if (activeTicket.status === "ESPERANDO_USUARIO") {
            await tx.supportTicket.update({
              where: { id: activeTicket.id },
              data: { status: "EN_PROGRESO" },
            });

            await tx.supportAuditLog.create({
              data: {
                supportTicketId: activeTicket.id,
                action: "STATUS_CHANGE",
                details: {
                  from: "ESPERANDO_USUARIO",
                  to: "EN_PROGRESO",
                  reason: "Usuario respondió por WA",
                },
              },
            });
          }
        });

        // Opcional: Reaccionar al mensaje de WhatsApp para que el usuario sepa que lo recibimos
        await msg.react("✅");
      }
    } catch (error) {
      console.error("[WhatsApp] Error procesando mensaje entrante:", error);
    }
  });

  // FIX PRINCIPAL: capturar el error de initialize() para que no tumbe
  // el proceso completo. Antes esto no tenía .catch() y por eso el
  // ProtocolError mataba el servidor entero en vez de solo el cliente WA.
  client.initialize().catch((err) => {
    console.error("[WhatsApp] Error al inicializar el cliente:", err.message);
    isClientReady = false;
    scheduleRestart();
  });
};

function scheduleRestart() {
  if (restartAttempts >= MAX_RESTART_ATTEMPTS) {
    console.error(
      `[WhatsApp] Se alcanzó el máximo de ${MAX_RESTART_ATTEMPTS} reintentos. ` +
        "No se reintentará automáticamente. Revisa la versión de whatsapp-web.js " +
        "o borra la carpeta .wwebjs_auth antes de reiniciar manualmente.",
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
    throw new Error(
      "El cliente de WhatsApp no está listo o se encuentra desconectado.",
    );
  }

  try {
    // 1. Validar el número y obtener el formato correcto (repara el 521 de México)
    const registeredUser = await client.getNumberId(phone);

    if (!registeredUser) {
      throw new Error(`El número ${phone} no está registrado en WhatsApp.`);
    }

    const chatId = registeredUser._serialized;

    // 2. Retraso aleatorio entre 2 y 4 segundos (Crucial para evitar baneos)
    const delayMs = Math.floor(Math.random() * 2000) + 2000;
    await new Promise((resolve) => setTimeout(resolve, delayMs));

    // 3. Enviamos el mensaje directo
    const response = await client.sendMessage(chatId, message);

    return response;
  } catch (error) {
    console.error(`[WhatsApp] Error al enviar mensaje a ${phone}:`, error);
    throw error;
  }
};

export const detenerWhatsApp = async () => {
  if (client) {
    console.log("[WhatsApp] Apagando el cliente y cerrando navegador...");
    try {
      await client.destroy();
      client = null;
      isClientReady = false;
      restartAttempts = 0;
      console.log("[WhatsApp] Bot completamente apagado.");
    } catch (error) {
      console.error("[WhatsApp] Error al intentar apagar el cliente:", error);
    }
  } else {
    console.log("[WhatsApp] El bot ya estaba apagado.");
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
    console.log("[WhatsApp] El bot ya está encendido o iniciándose.");
  }
};
