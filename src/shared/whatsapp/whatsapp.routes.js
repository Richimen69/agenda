import { Router } from "express";
import {
  startWhatsApp,
  stopWhatsApp,
  getWhatsAppStatus,
  sendMessage
} from "./whatsapp.controller.js";

const router = Router();
router.post("/start", startWhatsApp);
router.post("/stop", stopWhatsApp);
router.get("/status", getWhatsAppStatus);
router.post("/", sendMessage);

export default router;