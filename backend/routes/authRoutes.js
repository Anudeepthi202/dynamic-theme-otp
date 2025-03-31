const express = require("express");
const { sendOTP, verifyOTP } = require("../controllers/authController");

const router = express.Router();

router.post("/send-email-otp", sendOTP);
router.post("/verify-email-otp", verifyOTP);

module.exports = router;

