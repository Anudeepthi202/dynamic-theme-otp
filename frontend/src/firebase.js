import { auth } from "./config.js";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

// ✅ Set default language for authentication (optional)
auth.languageCode = "en"; // Change based on user preference

// ✅ Function to set up Recaptcha (prevent multiple setups)
function setUpRecaptcha(containerId) {
  if (!window.recaptchaVerifier) { // ✅ Prevent multiple instances
    window.recaptchaVerifier = new RecaptchaVerifier(
      containerId,
      {
        size: "invisible",
        callback: (response) => {
          console.log("✅ ReCAPTCHA Verified:", response);
        },
      },
      auth
    );
    window.recaptchaVerifier.render(); // ✅ Ensure it's rendered
  }
}

// ✅ Function to send OTP
function sendOTP(phoneNumber) {
  setUpRecaptcha("recaptcha-container");

  const appVerifier = window.recaptchaVerifier;
  signInWithPhoneNumber(auth, phoneNumber, appVerifier)
    .then((confirmationResult) => {
      window.confirmationResult = confirmationResult; // Store for verification step
      console.log(`✅ OTP Sent to ${phoneNumber} Successfully!`);
    })
    .catch((error) => {
      console.error("❌ Error Sending OTP:", error.message, error.code);
    });
}

// ✅ Function to verify OTP
function verifyOTP(otp) {
  if (!window.confirmationResult) {
    console.error("❌ Error: No OTP request found. Please resend OTP.");
    return;
  }

  window.confirmationResult
    .confirm(otp)
    .then((result) => {
      console.log("✅ OTP Verified Successfully!", result.user);
    })
    .catch((error) => {
      console.error("❌ Invalid OTP:", error.message, error.code);
    });
}

// ✅ Export Firebase functions
export { setUpRecaptcha, sendOTP, verifyOTP };
