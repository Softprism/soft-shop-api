import express from "express";
import { createUserConfig, updateUserFee } from "../controllers/userConfig.controller";
import auth from "../middleware/auth";

const router = express.Router();

router.post("/", auth, createUserConfig);
router.patch("/:userId", auth, updateUserFee);

export default router;
