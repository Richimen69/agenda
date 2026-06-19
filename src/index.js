// src/index.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import { createEvent, getEvents } from "./agenda.controller.js";
import prisma from "./prisma.js";
import "./queue.js";
import "./cron.js";
import "./whatsapp.js";
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
import { login, createUser, getUsers, deleteUser, hardDeleteUser  } from "./user.controller.js";
import { createLink, getLinks, redirectLink, getLinkStats  } from "./shortlink.controller.js"
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json()); // Para poder leer JSON en el body

app.post("/api/login", login);
app.get("/api/users", getUsers);
app.post("/api/users", createUser);
app.delete("/api/users/:id", deleteUser);
app.delete('/api/users/:id/hard', hardDeleteUser); 

// Nuestra ruta principal de Agenda
app.post("/api/events", createEvent);
app.get("/api/events", getEvents);
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
// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
