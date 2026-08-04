import { Router } from "express";
import { toggleSubtask, deleteSubtask } from "../tasks/ticket.controller.js";

const router = Router();

router.patch("/:subtaskId", toggleSubtask);
router.delete("/:subtaskId", deleteSubtask);

export default router;