const geolib = require("geolib");

const themes = {
    light: { background: "#ffffff", text: "#000000" },
    dark: { background: "#000000", text: "#ffffff" }
};

// ✅ Southern states with coordinates
const SOUTHERN_STATES = [
    { state: "Tamil Nadu", lat: 8.0883, lng: 77.5385 },
    { state: "Kerala", lat: 8.5241, lng: 76.9366 },
    { state: "Karnataka", lat: 12.9716, lng: 77.5946 },
    { state: "Andhra Pradesh", lat: 15.9129, lng: 79.7400 },
    { state: "Telangana", lat: 17.3850, lng: 78.4867 }
];

// ✅ Function to determine if the user is in a southern state
const isInSouthernState = (latitude, longitude) => {
    return SOUTHERN_STATES.some((state) =>
        geolib.isPointWithinRadius(
            { latitude: Number(latitude), longitude: Number(longitude) },
            { latitude: state.lat, longitude: state.lng },
            100000 // 100km radius
        )
    );
};

// ✅ Function to get the current theme based on time & location
exports.getTheme = (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        if (!latitude || !longitude) {
            return res.status(400).json({ error: "Latitude and longitude are required" });
        }

        const currentHour = new Date().getHours();
        let selectedTheme = themes.dark; // Default theme: Dark

        if (currentHour >= 10 && currentHour <= 12 && isInSouthernState(latitude, longitude)) {
            selectedTheme = themes.light; // White theme for South India (10 AM - 12 PM)
        }

        return res.status(200).json({ success: true, theme: selectedTheme });
    } catch (error) {
        console.error("Theme Selection Error:", error);
        return res.status(500).json({ error: "Failed to determine theme" });
    }
};

// ✅ Optional: Set a custom theme manually
exports.setTheme = (req, res) => {
    try {
        const { theme, background, text } = req.body;

        if (!theme || !background || !text) {
            return res.status(400).json({ error: "Incomplete theme details" });
        }

        themes[theme] = { background, text };
        return res.status(200).json({ success: true, message: "Theme updated successfully", themes });
    } catch (error) {
        console.error("Theme Update Error:", error);
        return res.status(500).json({ error: "Failed to update theme" });
    }
};
