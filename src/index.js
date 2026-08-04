import "dotenv/config";
import express from "express";
import cors from "cors";
import prisma from '#config/prisma';

import "./jobs/queue.js";
import "./jobs/cron.js";

import { redirectLink } from "./modules/marketing/shortlinks/shortlink.controller.js";

import authRoutes from "./shared/auth/auth.routes.js";
import { verifyToken } from "./shared/auth/auth.middleware.js"; // <- nuevo import
import userRoutes from "./modules/admin/user.routes.js";
import whatsappRoutes from "./shared/whatsapp/whatsapp.routes.js";
import agendaRoutes from "./modules/agenda/agenda.routes.js";
import tasksRoutes from "./modules/tasks/tasks.routes.js";
import subtaskRoutes from "./modules/tasks/subtask.routes.js";
import shortlinkRoutes from "./modules/marketing/shortlinks/shortlink.routes.js";
import projectRoutes from "./modules/projects/project.routes.js";
import kpiRoutes from "./modules/projects/kpi.routes.js";
import areaRoutes from "./modules/admin/area.routes.js";
import serviceTypeRoutes from "./modules/live/service-type.routes.js";
import liveSessionRoutes from "./modules/live/live-session.routes.js";
import leadsRoutes from "./modules/leads/leads.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Ruta especial pública (redirección de shortlinks, sin auth)
app.get("/s/:shortCode", redirectLink);

// Login es público (por eso va antes del verifyToken global)
app.use("/api", authRoutes); // contiene /api/login y /api/me

app.use("/api/service-types", serviceTypeRoutes);
app.use("/api/live-sessions", liveSessionRoutes);

// A partir de aquí, TODO /api requiere token válido
app.use("/api", verifyToken);

app.use("/api/users", userRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/events", agendaRoutes);
app.use("/api/tickets", tasksRoutes);
app.use("/api/subtasks", subtaskRoutes);
app.use("/api/links", shortlinkRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/kpis", kpiRoutes);
app.use("/api/areas", areaRoutes);
app.use("/api/leads", leadsRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});