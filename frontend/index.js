document.addEventListener("DOMContentLoaded", () => {
    applyTheme();
    setupStateSelection();
});

function setupStateSelection() {
    const stateSelect = document.getElementById("state");
    const loginForm = document.getElementById("loginForm");
    const emailField = document.getElementById("emailField");
    const phoneField = document.getElementById("phoneField");

    if (!stateSelect || !loginForm || !emailField || !phoneField) {
        console.error("🚨 ERROR: One or more form elements are missing in the HTML.");
        return;
    }

    stateSelect.addEventListener("change", () => {
        const selectedState = stateSelect.value;
        localStorage.setItem("userState", selectedState);

        if (selectedState === "south") {
            emailField.style.display = "block";
            phoneField.style.display = "none";
        } else if (selectedState === "north") {
            emailField.style.display = "none";
            phoneField.style.display = "block";
        }
        loginForm.style.display = "block";
        applyTheme();
    });
}

// ✅ Enable "Verify OTP" Button When User Enters OTP
document.getElementById("otpCode")?.addEventListener("input", () => {
    const otpValue = document.getElementById("otpCode").value.trim();
    document.getElementById("verifyOtpBtn").disabled = otpValue.length !== 6;
});

// ✅ Send OTP (Email for South, Phone for North)
document.getElementById("sendOtpBtn")?.addEventListener("click", async () => {
    const state = document.getElementById("state")?.value;
    const emailInput = document.getElementById("email")?.value?.trim();
    const phoneInput = document.getElementById("phoneNumber")?.value?.trim();

    if (state === "south") {
        if (!emailInput || !validateEmail(emailInput)) {
            alert("Please enter a valid email.");
            return;
        }
    } else if (state === "north") {
        if (!phoneInput || !/^\d{10}$/.test(phoneInput)) {
            alert("Please enter a valid 10-digit phone number.");
            return;
        }
    } else {
        alert("Please select a valid state.");
        return;
    }

    try {
        const url = state === "south" ? "http://localhost:5003/send-email-otp" : "http://localhost:5003/send-phone-otp";
        const body = state === "south" ? 
            { email: emailInput } : 
            { phone: "+91" + phoneInput }; // ✅ Fixed phone number formatting

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error("❌ Error sending OTP:", error);
        alert("Failed to send OTP.");
    }
});

// ✅ Verify OTP
document.getElementById("verifyOtpBtn")?.addEventListener("click", async () => {
    const state = document.getElementById("state")?.value;
    const emailInput = document.getElementById("email")?.value?.trim();
    const phoneInput = document.getElementById("phoneNumber")?.value?.trim();
    const enteredOtp = document.getElementById("otpCode")?.value?.trim();

    if (!enteredOtp || enteredOtp.length !== 6) {
        alert("Please enter a valid 6-digit OTP.");
        return;
    }

    try {
        const url = state === "south" ? "http://localhost:5003/verify-email-otp" : "http://localhost:5003/verify-phone-otp";
        const body = state === "south" ? 
            { email: emailInput, otp: enteredOtp } : 
            { phone: "+91" + phoneInput, otp: enteredOtp }; // ✅ Fixed phone number formatting

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error("❌ Error verifying OTP:", error);
        alert("OTP verification failed.");
    }
});

// ✅ Apply Theme Based on Time & Location
function applyTheme() {
    const now = new Date();
    const hour = now.getHours();
    const userState = localStorage.getItem("userState") || "";

    if (userState === "south" && hour >= 10 && hour <= 12) {
        document.body.classList.add("white-theme");
        document.body.classList.remove("dark-theme");
    } else {
        document.body.classList.add("dark-theme");
        document.body.classList.remove("white-theme");
    }
}

// ✅ Validate Email
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}