require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*", // Change this to your frontend URL in production
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Failed:", err));

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  otp: String,
  otpExpires: Date,
});
const User = mongoose.model("User", userSchema);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ✅ Send Email OTP
app.post("/send-email-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email is required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

  try {
    await User.findOneAndUpdate(
      { email },
      { $set: { otp, otpExpires } },
      { new: true, upsert: true }
    );

    console.log(`✅ OTP Saved in DB for ${email}: ${otp}`);

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP for login is: ${otp}`,
    });

    res.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("❌ Error Sending OTP:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

// ✅ Verify Email OTP
app.post("/verify-email-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ success: false, message: "Email and OTP are required" });

  try {
    const user = await User.findOne({ email });

    if (!user || String(user.otp).trim() !== String(otp).trim()) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (new Date(user.otpExpires).getTime() <= Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    await User.updateOne({ email }, { $unset: { otp: 1, otpExpires: 1 } });

    return res.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("❌ OTP Verification Error:", error);
    return res.status(500).json({ success: false, message: "Failed to verify OTP" });
  }
});

// ✅ Send Phone OTP (Simulated)
app.post("/send-phone-otp", async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ success: false, message: "Phone number is required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

  try {
    await User.findOneAndUpdate(
      { phone },
      { $set: { otp, otpExpires } },
      { new: true, upsert: true }
    );

    console.log(`✅ OTP Saved in DB for ${phone}: ${otp}`);

    // Simulating OTP sending (Replace this with Firebase OTP API)
    res.json({ success: true, message: `OTP sent to phone ${phone} (Simulated)` });
  } catch (error) {
    console.error("❌ Error Sending Phone OTP:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

// ✅ Verify Phone OTP
app.post("/verify-phone-otp", async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ success: false, message: "Phone and OTP are required" });

  try {
    const user = await User.findOne({ phone });

    if (!user || String(user.otp).trim() !== String(otp).trim()) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (new Date(user.otpExpires).getTime() <= Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    await User.updateOne({ phone }, { $unset: { otp: 1, otpExpires: 1 } });

    return res.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("❌ OTP Verification Error:", error);
    return res.status(500).json({ success: false, message: "Failed to verify OTP" });
  }
});

// ✅ Store Phone Number
app.post("/store-phone-number", async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ success: false, message: "Phone number is required" });

  try {
    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({ phone });
      await user.save();
    }

    res.json({ success: true, message: "Phone number stored successfully", user });
  } catch (error) {
    console.error("❌ Error Storing Phone Number:", error);
    res.status(500).json({ success: false, message: "Failed to store phone number" });
  }
});

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));