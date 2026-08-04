import { Router } from "express";
import { registrarAvanceKpi } from "./kpi.controller.js";

const router = Router();

router.post("/:kpiId/registros", registrarAvanceKpi);

export default router;