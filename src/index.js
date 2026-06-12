// src/index.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import { createEvent, getEvents } from './agenda.controller.js';
import prisma from "./prisma.js";
import "./queue.js";
import "./cron.js";
import "./whatsapp.js";
import {
  createTicket,
  updateTicketStatus,
  getTickets,
  addComment,
} from "./ticket.controller.js";
import { login, createUser, getUsers, deleteUser } from './user.controller.js';
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json()); // Para poder leer JSON en el body

app.post('/api/login', login);
app.get('/api/users', getUsers);
app.post('/api/users', createUser);
app.delete('/api/users/:id', deleteUser);

// Nuestra ruta principal de Agenda
app.post("/api/events", createEvent);
app.get('/api/events', getEvents);
// Rutas de Tickets / Proyectos
app.post('/api/tickets', createTicket);
app.get('/api/tickets', getTickets);
app.patch('/api/tickets/:id/status', updateTicketStatus);
app.post('/api/tickets/:id/comments', addComment);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
