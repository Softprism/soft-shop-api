import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    result: "API is working!",
    status: 200
  });
});

export default router;
