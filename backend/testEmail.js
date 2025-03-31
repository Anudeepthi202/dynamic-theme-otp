require("dotenv").config();
const nodemailer = require("nodemailer");

// ✅ Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_PORT == 465, // True for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ✅ Test Email Function
async function sendTestEmail() {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: "yourtestemail@example.com", // Change this to your email
    subject: "Test Email from Nodemailer",
    text: "If you received this email, your Nodemailer setup is working! 🎉",
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email Sent Successfully!", info.response);
  } catch (error) {
    console.error("❌ Email Sending Failed:", error);
  }
}

// Run the test
sendTestEmail();