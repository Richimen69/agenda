import { Router } from "express";
import { createKpi, addKpiRecord } from "./kpi.controller.js";

const router = Router();

router.post("/actions/:id/kpis", createKpi);
router.post("/:kpiId/records", addKpiRecord);

export default router;