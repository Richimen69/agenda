import { Router } from "express";
import { createArea, getAreasTree, deleteArea, updateArea } from "./area.controller.js";

const router = Router();

router.post("/", createArea);
router.get("/tree", getAreasTree);
router.put("/:id", updateArea);
router.delete("/:id", deleteArea);

export default router;