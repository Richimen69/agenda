import cron from 'node-cron';
import prisma from './prisma.js';
import { whatsappQueue } from './queue.js';

// Se ejecuta cada minuto ('* * * * *')
cron.schedule('* * * * *', async () => {
  console.log('[Cron] Buscando recordatorios pendientes...');
  
  try {
    const now = new Date();
    
    // 1. Buscar recordatorios PENDING cuya fecha programada ya pasó o es ahora
    const pendingReminders = await prisma.reminder.findMany({
      where: {
        status: 'PENDING',
        scheduledAt: { lte: now } // lte = Less Than or Equal (Menor o igual a ahora)
      },
      include: { user: true } // Traemos los datos del usuario para sacar su teléfono
    });

    if (pendingReminders.length === 0) {
      return; // No hay nada que enviar
    }

    console.log(`[Cron] ¡Encontrados ${pendingReminders.length} recordatorios! Encolando...`);

    // 2. Encolar cada mensaje
    for (const reminder of pendingReminders) {
      
      // A) Cambiamos el estado a PROCESSING para que el Cron no lo vuelva a agarrar el próximo minuto
      await prisma.reminder.update({
        where: { id: reminder.id },
        data: { status: 'PROCESSING' }
      });

      // B) Lo mandamos a la cola de Redis
      await whatsappQueue.add('send-whatsapp', {
        reminderId: reminder.id,
        phone: reminder.user.whatsappPhone,
        message: reminder.messagePayload
      });
    }

  } catch (error) {
    console.error('[Cron] Error en la ejecución:', error);
  }
});