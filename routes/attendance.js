import express from "express";
import Attendance from "../models/Attendance.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// Faculty marks attendance
router.post(
  "/mark",
  authenticateToken,
  authorizeRoles("faculty"),
  async (req, res) => {
    try {
      const { subject, attendanceRecords } = req.body;
      // attendanceRecords: [{ studentId, status: "present"|"absent" }]

      if (!subject || !attendanceRecords || !Array.isArray(attendanceRecords)) {
        return res.status(400).json({ message: "Invalid request" });
      }

      // Check faculty teaches the subject
      if (!req.user.subjects.includes(subject)) {
        return res.status(403).json({ message: "You don't teach this subject" });
      }

      // Save attendance for each student
      const today = new Date();
      const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      // Remove any existing attendance for same subject/date (optional)
      await Attendance.deleteMany({ subject, date: dateOnly });

      const attendanceDocs = attendanceRecords.map((record) => ({
        student: record.studentId,
        subject,
        date: dateOnly,
        status: record.status,
      }));

      await Attendance.insertMany(attendanceDocs);

      res.json({ message: "Attendance marked successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Student views attendance summary
router.get(
  "/summary",
  authenticateToken,
  authorizeRoles("student"),
  async (req, res) => {
    try {
      // Group attendance by subject
      const studentId = req.user._id;

      const attendance = await Attendance.aggregate([
        { $match: { student: studentId } },
        {
          $group: {
            _id: "$subject",
            total: { $sum: 1 },
            presentCount: {
              $sum: {
                $cond: [{ $eq: ["$status", "present"] }, 1, 0],
              },
            },
          },
        },
      ]);

      const result = attendance.map((item) => {
        const attendancePercent = item.total === 0 ? 0 : (item.presentCount / item.total) * 100;
        return {
          subject: item._id,
          totalClasses: item.total,
          present: item.presentCount,
          attendancePercent: attendancePercent.toFixed(2),
          alert: attendancePercent < 60,
        };
      });

      res.json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;
