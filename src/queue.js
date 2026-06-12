// src/queue.js
import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import prisma from './prisma.js';
import { sendWhatsAppMessage } from './whatsapp.js'; // Importamos la funcion real

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null
});

export const whatsappQueue = new Queue('whatsapp-messages', { connection });

const worker = new Worker('whatsapp-messages', async (job) => {
  const { reminderId, phone, message } = job.data;
  
  console.log(`\n[Worker] Procesando mensaje para ${phone}...`);
  
  try {
    // LLAMADA REAL A WHATSAPP
    await sendWhatsAppMessage(phone, message);
    
    console.log(`[Worker] Mensaje enviado con exito a ${phone}.`);

    await prisma.reminder.update({
      where: { id: reminderId },
      data: { status: 'SENT', sentAt: new Date() }
    });

  } catch (error) {
    console.error(`[Worker] Error enviando a ${phone}:`, error);
    
    await prisma.reminder.update({
      where: { id: reminderId },
      data: { status: 'FAILED', errorLog: error.message }
    });
  }
}, { connection });

worker.on('failed', (job, err) => {
  console.log(`[Worker] El job ${job.id} fallo: ${err.message}`);
});