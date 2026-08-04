import { Router } from "express";
import { verifyToken, requireModuleAccess } from "../../shared/auth/auth.middleware.js";
import { getServiceTypes, createServiceType } from "./session.controller.js";

const router = Router();

router.get("/", getServiceTypes); // pública, solo catálogo de lectura
router.post("/", verifyToken, requireModuleAccess("LIVE_ADMIN"), createServiceType);

export default router;