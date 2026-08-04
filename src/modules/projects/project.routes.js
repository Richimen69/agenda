import { Router } from "express";
import { addProject, getProjects, getProjectById } from "./project.controller.js";
import { asignarParticipante } from "./participant.controller.js";
import { crearAccion, obtenerArbolDeAcciones } from "./accion.controller.js";

const router = Router();

router.post("/", addProject);
router.get("/", getProjects);
router.get("/:id", getProjectById);

// Sub-rutas de proyectos
router.post("/:id/participantes", asignarParticipante);
router.post("/:id/acciones", crearAccion);
router.get("/:id/acciones", obtenerArbolDeAcciones);

export default router;