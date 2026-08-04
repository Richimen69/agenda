import { Router } from "express";
import { createLink, getLinks, getLinkStats, deleteLink } from "./shortlink.controller.js";

const router = Router();

router.post("/", createLink);
router.get("/", getLinks);
router.get("/stats", getLinkStats);
router.delete("/:id", deleteLink);

export default router;