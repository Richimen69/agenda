import { Router } from "express";
import { addProject, getProjects, getProjectById } from "./project.controller.js";
import { asignarParticipante } from "./participant.controller.js";
import { createAction, getActionTree } from "./action.controller.js";

const router = Router();

router.post("/", addProject);
router.get("/", getProjects);
router.get("/:id", getProjectById);

// Sub-rutas de proyectos
router.post("/:id/participant", asignarParticipante);
router.post("/:id/actions", createAction);
router.get("/:id/actions", getActionTree);

export default router;