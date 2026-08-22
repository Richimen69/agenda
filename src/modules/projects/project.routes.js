import { Router } from "express";
import { addProject, getProjects, getProjectById, createProjectRatio, addProjectComment, getGlobalDashboard   } from "./project.controller.js";
import { asignarParticipante } from "./participant.controller.js";
import { createAction, getActionTree } from "./action.controller.js";

const router = Router();

router.post("/", addProject);
router.get("/dashboard/global", getGlobalDashboard);
router.get("/", getProjects);
router.get("/:id", getProjectById);

// Sub-rutas de proyectos
router.post("/:id/participant", asignarParticipante);
router.post("/:id/ratios", createProjectRatio);
router.post("/:id/comments", addProjectComment);
router.post("/:id/actions", createAction);
router.get("/:id/actions", getActionTree);

export default router;