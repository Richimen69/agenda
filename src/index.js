import "dotenv/config";
import express from "express";
import cors from "cors";
import {
  createEvent,
  getEvents,
  getEventById,
  deleteEvent,
  updateEvent,
} from "./agenda.controller.js";
import prisma from "./prisma.js";
import "./queue.js";
import "./cron.js";
import {
  detenerWhatsApp,
  encenderWhatsApp,
  getStatusWhatsApp,
  sendWhatsAppMessage
} from "./whatsapp.js";
import {
  createTicket,
  updateTicketStatus,
  updateTicketPriority,
  getTickets,
  addComment,
  deleteTicket,
  getTicketById,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  updateTicketAssignees,
} from "./ticket.controller.js";
import {
  login,
  createUser,
  getUsers,
  deleteUser,
  hardDeleteUser,
  editUser,
  getUserById,
} from "./user.controller.js";
import {
  createLink,
  getLinks,
  redirectLink,
  getLinkStats,
  deleteLink,
} from "./shortlink.controller.js";
import {
  addProject,
  obtenerDashboard,
  getProjects,
  getProjectById,
} from "./project.controller.js";
import { crearAccion, obtenerArbolDeAcciones } from "./accion.controller.js";
import { asignarParticipante } from "./participant.controller.js";
import { registrarAvanceKpi } from "./kpi.controller.js";
import { createArea, getAreasTree, deleteArea } from "./area.controller.js";
import {
  getServiceTypes,
  getLiveSessions,
  getLiveSession,
  createLiveSession,
  updateLiveSessionStage,
  finishLiveSession,
  deleteLiveSession,
  generateLiveKitToken,
  createServiceType
} from "./session.controller.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json()); // Para poder leer JSON en el body

app.post("/api/login", login);
app.get("/api/users", getUsers);
app.post("/api/users", createUser);
app.delete("/api/users/:id", deleteUser);
app.delete("/api/users/:id/hard", hardDeleteUser);
app.patch("/api/users/:id", editUser);
app.get("/api/users/:id", getUserById);

app.post("/api/whatsapp/start", (req, res) => {
  try {
    const result = encenderWhatsApp();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/whatsapp/stop", async (req, res) => {
  try {
    const result = await detenerWhatsApp();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/whatsapp/status", (req, res) => {
  try {
    const status = getStatusWhatsApp();
    res.json(status);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/whatsapp", async (req, res) => {
  const { phone, message } = req.body;

  // Validación básica de los datos de entrada
  if (!phone || !message) {
    return res.status(400).json({ 
      error: "Se requieren los campos 'phone' y 'message' en el cuerpo de la petición." 
    });
  }

  try {
    // Llamas a tu función pasando los parámetros del request
    const response = await sendWhatsAppMessage(phone, message);
    
    return res.status(200).json({
      success: true,
      message: "Mensaje enviado correctamente",
      data: response
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Error al enviar el mensaje de WhatsApp"
    });
  }
});


// Nuestra ruta principal de Agenda
app.post("/api/events", createEvent);
app.get("/api/events", getEvents);
app.get("/api/events/:id", getEventById);
app.delete("/api/events/:id", deleteEvent);
app.put("/api/events/:id", updateEvent);
// Rutas de Tickets / Proyectos
app.post("/api/tickets", createTicket);
app.get("/api/tickets", getTickets);
app.get("/api/tickets/:id", getTicketById);
app.patch("/api/tickets/:id/status", updateTicketStatus);
app.patch("/api/tickets/:id/priority", updateTicketPriority);
app.post("/api/tickets/:id/comments", addComment);
app.delete("/api/tickets/:id", deleteTicket);

app.post("/api/tickets/:id/subtasks", addSubtask);
app.patch("/api/subtasks/:subtaskId", toggleSubtask);
app.delete("/api/subtasks/:subtaskId", deleteSubtask);
app.patch("/api/tickets/:id/assignees", updateTicketAssignees);

app.post("/api/links", createLink);
app.get("/api/links", getLinks);
app.get("/api/links/stats", getLinkStats);
app.get("/s/:shortCode", redirectLink);
app.delete("/api/links/:id", deleteLink);

// Proyectos y Dashboard
app.post("/api/projects", addProject);
app.get("/api/projects", getProjects);         
app.get("/api/projects/:id", getProjectById);

// Participantes (Matriz RACI)
app.post("/api/projects/:id/participantes", asignarParticipante);

// Acciones Jerárquicas
app.post("/api/projects/:id/acciones", crearAccion);
app.get("/api/projects/:id/acciones", obtenerArbolDeAcciones);

// KPIs y Avances
app.post("/api/kpis/:kpiId/registros", registrarAvanceKpi);

// Áreas y Departamentos
app.post("/api/areas", createArea);
app.get("/api/areas/tree", getAreasTree);
app.delete("/api/areas/:id", deleteArea);

app.get("/api/service-types", getServiceTypes); // Obtener catálogo de servicios y etapas
app.post("/api/live-sessions", createLiveSession);
app.get("/api/live-sessions", getLiveSessions);
app.get("/api/live-sessions/:id", getLiveSession);
app.patch("/api/live-sessions/:id/stage", updateLiveSessionStage); // Actualizar progreso
app.patch("/api/live-sessions/:id/finish", finishLiveSession); // Finalizar (Usa PATCH para ser consistente con tus tickets)
app.delete("/api/live-sessions/:id", deleteLiveSession);
app.post("/api/live-sessions/token", generateLiveKitToken);
app.post("/api/service-types", createServiceType);
// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo`);
});
