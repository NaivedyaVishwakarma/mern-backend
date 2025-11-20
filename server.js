import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import attendanceRoutes from "./routes/attendance.js";
import userRoutes from "./routes/user.js";

dotenv.config();

const app = express();
app.use(cors({
  origin: [
    "https://frontend-three-lake-44.vercel.app"   // your Vercel URL
  ],
  methods: "GET,POST,PUT,DELETE",
  credentials: true
}));

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/users", userRoutes);

// Basic About Us endpoint
app.get("/api/about", (req, res) => {
  res.json({
    institution: "Your Institution Name",
    description: "Attendance Management & Automated Notification System",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

