import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ["present", "absent"], required: true },
});

export default mongoose.model("Attendance", attendanceSchema);
