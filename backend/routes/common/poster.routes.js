import express from "express";
import { getActivePosters, getAllPosters } from "../../controller/common/posterController.js";

const router = express.Router();

// Public route - anyone can access active posters
router.get("/public/active", getActivePosters);

// Protected routes - admin only
router.get("/", getAllPosters);

export default router;