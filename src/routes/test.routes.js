import express from "express";
import { signupLog } from "../services/logs.service";

const router = express.Router();

router.get("/", (req, res, next) => {
  return res.status(200).json({
    success: true,
    result: `API is working! Socket for push notifications ${new Date().toString()}`,
    env: process.env.GOOGLE_MAPS_API_KEY,
    status: 200
  });
});

export default router;
