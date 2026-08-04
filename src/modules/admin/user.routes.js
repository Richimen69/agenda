import { Router } from "express";
import { createUser, getUsers, deleteUser, hardDeleteUser, editUser, getUserById } from "./user.controller.js";

const router = Router();

router.post("/", createUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.patch("/:id", editUser);
router.delete("/:id", deleteUser);
router.delete("/:id/hard", hardDeleteUser);

export default router;