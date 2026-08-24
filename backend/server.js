require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Route files
const authRoutes = require("./routes/authRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const labRoutes = require("./routes/labRoutes");
const bloodBankRoutes = require("./routes/bloodBankRoutes");
const bedRoutes = require("./routes/bedRoutes");
const billingRoutes = require("./routes/billingRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const qrRoutes = require("./routes/qrRoutes");
const patientRoutes = require("./routes/patientRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Health check
app.get("/", (req, res) => {
  res.send("CureConnect API is running");
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/lab-reports", labRoutes);
app.use("/api/blood-bank", bloodBankRoutes);
app.use("/api/beds", bedRoutes);
app.use("/api/bills", billingRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/patients", patientRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));