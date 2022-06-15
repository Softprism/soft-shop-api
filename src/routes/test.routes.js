import express from "express";
import { createLog } from "../services/logs.service";
import { sendOne, sendTopic } from "../services/push.service";

const router = express.Router();

router.get("/", (req, res, next) => {
  return res.status(200).json({
    success: true,
    result: `API is working! in ${process.env.NODE_ENV} mode on Cpanel Server - the time is ${new Date().toString()}`,
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

router.post("/send-push-topic",
  async (req, res, next) => {
    const {
      topic, title, body, data, app
    } = req.body;
    try {
      let request = await sendTopic(app, topic, title, body, data);
      return res.status(200).json({
        success: true,
        result: request,
        status: 200
      });
    } catch (error) {
      next(error);
    }
  });

router.post("/sms-feedback",
  async (req, res, next) => {
    const messageSid = req.body.MessageSid;
    const messageStatus = req.body.MessageStatus;

    console.log(`SID: ${messageSid}, Status: ${messageStatus}`);

    res.sendStatus(200);
    await createLog("send sms", "softshop", messageStatus);
  });

export default router;
