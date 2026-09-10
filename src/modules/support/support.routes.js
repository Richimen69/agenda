import { Router } from "express";
import {
  addTicketComment,
  createSupportTicket,
  updateTicketStatus,
  getTickets,
  getTicketById,
  getAllCategoriesAdmin,
  createCategory,
  updateCategory,
  getTechUsers,
  getSupportCategories,
  getSupportMetrics
} from "./support.controller.js";
import { uploadMiddleware } from "../../middlewares/upload.js";

const router = Router();
router.get("/admin/categories", getAllCategoriesAdmin);
router.get("/categories", getSupportCategories);
router.get("/metrics", getSupportMetrics);

router.post("/admin/categories", createCategory);
router.patch("/admin/categories/:id", updateCategory);
router.get("/admin/techs", getTechUsers);
router.get("/tickets", getTickets);
router.get("/tickets/:id", getTicketById);
router.post(
  "/tickets",
  uploadMiddleware.array("files", 5),
  createSupportTicket,
);

router.post(
  "/tickets/comments",
  uploadMiddleware.array("files", 5),
  addTicketComment,
);
router.patch("/tickets/:id/status", updateTicketStatus);

export default router;
