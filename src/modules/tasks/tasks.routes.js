import { Router } from "express";
import { 
  createTicket, updateTicketStatus, updateTicketPriority, 
  getTickets, addComment, deleteTicket, getTicketById, 
  addSubtask, updateTicketAssignees 
} from "./ticket.controller.js";

const router = Router();

router.post("/", createTicket);
router.get("/", getTickets);
router.get("/:id", getTicketById);
router.patch("/:id/status", updateTicketStatus);
router.patch("/:id/priority", updateTicketPriority);
router.patch("/:id/assignees", updateTicketAssignees);
router.post("/:id/comments", addComment);
router.post("/:id/subtasks", addSubtask);
router.delete("/:id", deleteTicket);

export default router;