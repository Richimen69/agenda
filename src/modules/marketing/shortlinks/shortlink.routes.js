import { Router } from "express";
import { createLink, getLinks, getLinkStats, deleteLink, getMonthlyStats } from "./shortlink.controller.js";

const router = Router();

router.post("/", createLink);
router.get("/", getLinks);
router.get("/stats", getLinkStats);
router.delete("/:id", deleteLink);
router.get("/:id/stats", getMonthlyStats);
export default router;