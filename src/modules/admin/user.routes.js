import { Router } from "express";
import {
  createUser,
  getUsers,
  deleteUser,
  hardDeleteUser,
  editUser,
  getUserById,
  changePassword,
  resetPassword,
} from "./user.controller.js";

const router = Router();
router.patch("/change-password", changePassword);
router.patch("/reset-password", resetPassword);
router.post("/", createUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.patch("/:id", editUser);
router.delete("/:id", deleteUser);
router.delete("/:id/hard", hardDeleteUser);

export default router;
