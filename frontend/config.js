import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Buffer } from "buffer";  // ✅ Fix for Firebase Buffer issue

// ✅ Global fix for Buffer issue
window.Buffer = Buffer;

// ✅ Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZ7SnDS0nmlj_mjRw39KbQZPmr3XFFWmk",
  authDomain: "dynamic-theme-and-otp.firebaseapp.com",
  projectId: "dynamic-theme-and-otp",
  storageBucket: "dynamic-theme-and-otp.appspot.com",
  messagingSenderId: "326573174585",
  appId: "1:326573174585:web:d7a647c61fbd03496f82e8",
};

// ✅ Initialize Firebase Services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Function to Detect User Location and Apply Theme
export function applyTheme() {
  const hour = new Date().getHours();

  // ✅ Try to get user's location
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const location = await getLocationFromCoords(latitude, longitude);
        console.log("Detected State:", location);

        // ✅ South Indian states use White theme between 10 AM - 12 PM
        if (
          hour >= 10 &&
          hour < 12 &&
          ["Tamil Nadu", "Kerala", "Karnataka", "Andhra Pradesh", "Telangana"].includes(location)
        ) {
          document.body.classList.add("white-theme");
        } else {
          document.body.classList.add("dark-theme");
        }
      } catch (error) {
        console.error("Error fetching location:", error);
        applyFallbackTheme();
      }
    },
    (error) => {
      console.error("Error getting location:", error.message);
      applyFallbackTheme();
    }
  );
}

// ✅ Function to Get State Name from Coordinates
async function getLocationFromCoords(lat, lon) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
    if (!response.ok) throw new Error("Failed to fetch location data");
    const data = await response.json();
    return data.address?.state || "Unknown";
  } catch (error) {
    console.error("Geolocation API Error:", error);
    return "Unknown";
  }
}

// ✅ Apply fallback theme if geolocation fails
function applyFallbackTheme() {
  document.body.classList.add("dark-theme"); // Default to dark theme
}

// ✅ Export Firestore, Auth, and Firebase App
export { db, auth };
export default firebaseConfig;
