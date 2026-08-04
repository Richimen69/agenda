import { Router } from "express";
import { requireModuleAccess } from "../../shared/auth/auth.middleware.js";
import {
  getLeads, getRecoveryLeads, createLead, updateLead,
  addComment, deleteLead, checkDuplicatePhones, reactivateLead,
} from "./leads.controller.js";

const router = Router();

router.get('/', requireModuleAccess("LEADS_ADMIN", "LEADS_AUX"), getLeads);
router.get('/recovery', requireModuleAccess("LEADS_ADMIN", "LEADS_AUX"), getRecoveryLeads);
router.post('/', requireModuleAccess("LEADS_ADMIN"), createLead);
router.put('/:id', requireModuleAccess("LEADS_ADMIN", "LEADS_AUX"), updateLead);
router.post('/:leadId/comments', requireModuleAccess("LEADS_ADMIN", "LEADS_AUX"), addComment);
router.delete('/:id', requireModuleAccess("LEADS_ADMIN"), deleteLead);
router.post("/check-duplicates", requireModuleAccess("LEADS_ADMIN", "LEADS_AUX"), checkDuplicatePhones);
router.post("/:id/reactivate", requireModuleAccess("LEADS_ADMIN", "LEADS_AUX"), reactivateLead);

export default router;