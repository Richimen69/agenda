import { Router } from "express";
import { requireModuleAccess } from "../../shared/auth/auth.middleware.js";
import {
  getLeads,
  getRecoveryLeads,
  createLead,
  updateLead,
  addComment,
  deleteLead,
  checkDuplicatePhones,
  reactivateLead,
  getCampaignResults,
  getRecoveryFunnel,
  getDigitalFunnel,
} from "./leads.controller.js";
import { getGeneratedAmount, getLeadsCount } from "./kpi.controller.js";

const router = Router();

router.get("/", requireModuleAccess("LEADS_ADMIN", "LEADS_AUX"), getLeads);
router.get(
  "/recovery",
  requireModuleAccess("LEADS_ADMIN", "LEADS_AUX"),
  getRecoveryLeads,
);
router.post("/", requireModuleAccess("LEADS_ADMIN"), createLead);
router.put("/:id", requireModuleAccess("LEADS_ADMIN", "LEADS_AUX"), updateLead);
router.post(
  "/:leadId/comments",
  requireModuleAccess("LEADS_ADMIN", "LEADS_AUX"),
  addComment,
);
router.delete("/:id", requireModuleAccess("LEADS_ADMIN"), deleteLead);
router.post(
  "/check-duplicates",
  requireModuleAccess("LEADS_ADMIN", "LEADS_AUX"),
  checkDuplicatePhones,
);
router.post(
  "/:id/reactivate",
  requireModuleAccess("LEADS_ADMIN", "LEADS_AUX"),
  reactivateLead,
);
router.get(
  "/dashboard/campaigns",
  requireModuleAccess("LEADS_ADMIN", "LEADS_AUX"),
  getCampaignResults,
);
router.get("/dashboard/recovery", getRecoveryFunnel);
router.get("/dashboard/digital-funnel", getDigitalFunnel);
router.get("/kpi/generated-amount", getGeneratedAmount);
router.get("/kpi/leads-count", getLeadsCount);

export default router;
