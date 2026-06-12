// src/agenda.controller.js
import prisma from "./prisma.js";

export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      scheduledAt,
      creatorId,
      attendeeIds,
      ticketId,
    } = req.body;

    // 1. Convertimos la fecha del evento a un objeto Date
    const eventDate = new Date(scheduledAt);

    // 2. Calculamos cuándo enviar el WhatsApp (Ej: 1 hora antes del evento)
    const reminderDate = new Date(eventDate.getTime() - 60 * 60 * 1000);

    // 3. Creamos el evento y conectamos a los invitados usando Prisma
    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        scheduledAt: eventDate,
        creatorId,
        ticketId: ticketId || null,
        // Conectamos a los usuarios invitados por su ID
        attendees: {
          connect: attendeeIds.map((id) => ({ id })),
        },
      },
      // Le pedimos a Prisma que nos devuelva los datos de los invitados para sacar sus nombres
      include: {
        attendees: true,
      },
    });

    // 4. Generamos la cola de recordatorios (Uno para cada invitado)
    const formattedDate = eventDate.toLocaleString("es-MX", {
      timeZone: "America/Mexico_City",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // 5. Generamos la cola de recordatorios
    const remindersData = newEvent.attendees.map((attendee) => ({
      userId: attendee.id,
      eventId: newEvent.id,
      ticketId: ticketId || null,
      scheduledAt: reminderDate,
      messagePayload: `Hola ${attendee.name}, recordatorio: Tienes el evento "${title}" programado para el ${formattedDate}.`,
    }));

    // Insertamos todos los recordatorios de golpe en la BD
    if (remindersData.length > 0) {
      await prisma.reminder.createMany({
        data: remindersData,
      });
    }

    res.status(201).json({
      success: true,
      message: "Evento y recordatorios creados con éxito",
      data: newEvent,
    });
  } catch (error) {
    console.error("Error creando evento:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
// Obtener todos los eventos
export const getEvents = async (req, res) => {
  try {
    const { userId } = req.query;

    // Filtro: Traer eventos donde el usuario sea el creador O este en la lista de invitados
    const whereClause = userId
      ? {
          OR: [{ creatorId: userId }, { attendees: { some: { id: userId } } }],
        }
      : {};

    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        creator: { select: { name: true } },
        attendees: { select: { name: true } },
      },
      orderBy: { scheduledAt: "asc" },
    });
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
