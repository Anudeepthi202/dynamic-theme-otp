const express = require("express");
const { getTheme, setTheme } = require("../controllers/themeController");

const router = express.Router();

// ✅ Route to get the current theme based on location & time
router.post("/check-theme", getTheme); // Changed to POST to receive location in body

// ✅ Route to set a custom theme (optional)
router.post("/set-theme", setTheme);

module.exports = router;
