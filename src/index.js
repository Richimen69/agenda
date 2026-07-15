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
  crearProyecto,
  obtenerDashboard,
  obtenerProyectoPorId,
} from "./proyecto.controller.js";
import { crearAccion, obtenerArbolDeAcciones } from "./accion.controller.js";
import { asignarParticipante } from "./participante.controller.js";
import { registrarAvanceKpi } from "./kpi.controller.js";
import { createArea, getAreasTree, deleteArea } from "./area.controller.js";
import {
  getLiveSessions,
  getLiveSession,
  createLiveSession,
  finishLiveSession,
  deleteLiveSession,
  generateLiveKitToken,
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
app.post("/api/proyectos", crearProyecto);
app.get("/api/proyectos/dashboard", obtenerDashboard);
app.get("/api/proyectos/:id", obtenerProyectoPorId);

// Participantes (Matriz RACI)
app.post("/api/proyectos/:id/participantes", asignarParticipante);

// Acciones Jerárquicas
app.post("/api/proyectos/:id/acciones", crearAccion);
app.get("/api/proyectos/:id/acciones", obtenerArbolDeAcciones);

// KPIs y Avances
app.post("/api/kpis/:kpiId/registros", registrarAvanceKpi);

// Áreas y Departamentos
app.post("/api/areas", createArea);
app.get("/api/areas/tree", getAreasTree);
app.delete("/api/areas/:id", deleteArea);

app.post("/api/live-sessions", createLiveSession);
app.get("/api/live-sessions", getLiveSessions);
app.get("/api/live-sessions/:id", getLiveSession);
app.put("/api/live-sessions/:id/finish", finishLiveSession);
app.delete("/api/live-sessions/:id", deleteLiveSession);
app.post("/api/live-sessions/token", generateLiveKitToken);
// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo`);
});
