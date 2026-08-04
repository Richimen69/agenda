import { Router } from "express";
import { verifyToken, requireModuleAccess } from "../../shared/auth/auth.middleware.js";
import {
  getLiveSessions,
  getLiveSession,
  createLiveSession,
  updateLiveSessionStage,
  finishLiveSession,
  deleteLiveSession,
  generateLiveKitToken,
  getKioskSession
} from "./session.controller.js";

const router = Router();

// PÚBLICAS — sin verifyToken, las usa el kiosco y el cliente sin login
router.post("/token", generateLiveKitToken); // antes de /:id, igual que ya lo tenías
router.get("/", getLiveSessions); // polling del kiosco Y panel admin, mismo endpoint
router.get("/:id", getLiveSession); // TechnicianLayout / ClientLayout

// PROTEGIDAS — solo admin/asesor autenticado
router.post("/", verifyToken, requireModuleAccess("LIVE_ADMIN"), createLiveSession);
router.patch("/:id/stage", verifyToken, requireModuleAccess("LIVE_ADMIN"), updateLiveSessionStage);
router.patch("/:id/finish", verifyToken, requireModuleAccess("LIVE_ADMIN"), finishLiveSession);
router.delete("/:id", verifyToken, requireModuleAccess("LIVE_ADMIN"), deleteLiveSession);
router.get("/kiosk/:technicianId", getKioskSession);

export default router;