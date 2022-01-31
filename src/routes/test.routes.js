import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    result: "API is working!",
    env: process.env.GOOGLE_MAPS_API_KEY,
    status: 200
  });
});

export default router;
