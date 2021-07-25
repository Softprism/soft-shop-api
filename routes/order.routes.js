import express from 'express';
import { check, validationResult } from 'express-validator';
import { auth } from '../middleware/auth.js'
const router = express.Router();

export default router;