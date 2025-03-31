const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true, // Ensure case-insensitive uniqueness
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"], // Validate email format
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"], // Validate phone number
    },
    otp: { type: String, select: false }, // Hide OTP from queries for security
    otpExpires: { type: Date, select: false }, // Hide expiration date from queries
    location: { type: String, trim: true }, // Store user's state
    loginTime: { type: Date, default: Date.now }, // Capture login time
    themePreference: { type: String, enum: ["white", "dark"], default: "dark" },
  },
  { timestamps: true } // Adds createdAt & updatedAt fields automatically
);

module.exports = mongoose.model("User", userSchema);
