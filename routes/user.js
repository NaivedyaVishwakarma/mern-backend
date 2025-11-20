import express from "express";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Get profile
router.get("/profile", authenticateToken, (req, res) => {
  const user = req.user;
  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    subjects: user.subjects,
  });
});

export default router;

import User from "../models/User.js";

// Fetch all students
router.get("/all-students", async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("_id name");
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

