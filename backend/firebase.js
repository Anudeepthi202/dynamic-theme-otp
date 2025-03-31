const admin = require("firebase-admin");
const fs = require("fs");
require("dotenv").config();

// ✅ Load Firebase credentials from firebase-config.json or .env
let serviceAccount;
if (fs.existsSync("./firebase-config.json")) {
  serviceAccount = JSON.parse(fs.readFileSync("./firebase-config.json", "utf8"));
} else if (process.env.FIREBASE_PRIVATE_KEY) {
  serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"), // Fixes multiline key issue
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
  };
} else {
  throw new Error("Firebase configuration is missing! Ensure you have a valid firebase-config.json or .env variables.");
}

// ✅ Initialize Firebase Admin SDK (Avoid re-initialization)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;
