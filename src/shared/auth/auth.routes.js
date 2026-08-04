import { Router } from "express";
import { login, getMe, } from "../../modules/admin/user.controller.js";
import { verifyToken } from "./auth.middleware.js";

const router = Router();

router.post("/login", login);
router.get("/me", verifyToken, getMe);

export default router;