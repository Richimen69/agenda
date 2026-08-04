import { Router } from "express";
import { createArea, getAreasTree, deleteArea } from "./area.controller.js";

const router = Router();

router.post("/", createArea);
router.get("/tree", getAreasTree);
router.delete("/:id", deleteArea);

export default router;