const nodemailer = require("nodemailer");
const OTPModel = require("../models/OTPModel"); // Import the OTP model
const mongoose = require("mongoose");
require("dotenv").config();

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Function to send OTP via Email
const sendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 mins

  console.log(`📩 Sending OTP: ${otp} to ${email}`);

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP for login is: ${otp}. It is valid for 5 minutes.`,
  };

  try {
    // Store OTP in MongoDB (replace old OTP if exists)
    await OTPModel.findOneAndUpdate(
      { email }, 
      { otp, otpExpires }, 
      { upsert: true, new: true }
    );

    await transporter.sendMail(mailOptions);
    console.log("✅ Email OTP sent successfully!");
    return res.json({ success: true, message: "OTP sent to email successfully!" });
  } catch (error) {
    console.error("❌ Email OTP Error:", error);
    return res.status(500).json({ success: false, message: "Failed to send OTP via email", error: error.message });
  }
};

// Function to verify OTP
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Email and OTP are required" });
  }

  try {
    // Find OTP record
    const otpRecord = await OTPModel.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.otpExpires) {
      await OTPModel.deleteOne({ email }); // Delete expired OTP
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    // Validate OTP
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // OTP is valid, delete it from DB
    await OTPModel.deleteOne({ email });

    return res.json({ success: true, message: "OTP verified successfully!" });

  } catch (error) {
    console.error("❌ OTP Verification Error:", error);
    return res.status(500).json({ success: false, message: "Error verifying OTP", error: error.message });
  }
};

module.exports = { sendOTP, verifyOTP };
