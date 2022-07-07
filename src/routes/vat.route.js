import express from "express";
import { createVat, removeVat } from "../controllers/vat.controller";
import auth from "../middleware/auth";

const router = express.Router();

router.post("/", auth, createVat);
router.delete("/:vatId", auth, removeVat);

export default router;
