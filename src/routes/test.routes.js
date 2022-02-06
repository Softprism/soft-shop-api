import express from "express";
import { signupLog } from "../services/logs.service";

const router = express.Router();

router.get("/", (req, res, next) => {
  next();
  return res.status(200).json({
    success: true,
    result: "API is working!",
    env: process.env.GOOGLE_MAPS_API_KEY,
    status: 200
  });
}, signupLog);

export default router;
