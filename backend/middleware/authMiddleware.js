const User = require("../models/userModel");

const authMiddleware = async (req, res, next) => {
    try {
        const { email, phone, otp } = req.body;

        if (!otp || (!email && !phone)) {
            return res.status(400).json({ message: "OTP and either email or phone are required" });
        }

        // ✅ Check if user exists based on email or phone
        const user = await User.findOne({ $or: [{ email }, { phone }] });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // ✅ Check if OTP is valid and not expired
        if (!user.otp || user.otp !== otp || !user.otpExpires || new Date() > user.otpExpires) {
            return res.status(401).json({ message: "Invalid or expired OTP" });
        }

        // ✅ OTP is valid, so remove it from the database for security
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        // ✅ Attach user info to request object (if needed later in the request chain)
        req.user = user;

        // ✅ Continue to the next middleware or route
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        res.status(500).json({ message: "Authentication failed", error });
    }
};

module.exports = authMiddleware;
