import express from "express";
import admin from "firebase-admin";
import { readFile } from "fs/promises";
import serviceAccount from "../config/softshop-order-firebase-adminsdk-yo40z-cfe8665739.json";
import { signupLog } from "../services/logs.service";
import { sendOne } from "../services/push.service";

const router = express.Router();

router.get("/", (req, res, next) => {
  return res.status(200).json({
    success: true,
    result: `API is working! Cpanel Server - the time is ${new Date().toString()}`,
    status: 200
  });
});

router.post("/send-push",
  async (req, res, next) => {
    const {
      deviceToken, title, body, data, app
    } = req.body;
    try {
      let request = await sendOne(app, deviceToken, title, body, data);
      return res.status(200).json({
        success: true,
        result: request,
        status: 200
      });
    } catch (error) {
      next(error);
    }
  });

export default router;
