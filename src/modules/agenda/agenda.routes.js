import { Router } from "express";
import { createEvent, getEvents, getEventById, deleteEvent, updateEvent } from "./agenda.controller.js";

const router = Router();

router.post("/", createEvent);
router.get("/", getEvents);
router.get("/:id", getEventById);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

export default router;