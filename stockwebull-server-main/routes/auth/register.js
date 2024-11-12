const express = require("express");
const { hashPassword, sendWelcomeEmail, resendWelcomeEmail, resetEmail, sendUserDetails } = require("../../utils");
const UsersDatabase = require("../../models/User");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();

// Function to generate a referral code
function generateReferralCode(length = 6) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

// User registration route
router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password, country, referralCode } = req.body;

  try {
    // Check if the email is already taken
    const existingUser = await UsersDatabase.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email address is already taken" });
    }

    // Find the referrer based on the referral code, if provided
    let referrer = null;
    if (referralCode) {
      referrer = await UsersDatabase.findOne({ referralCode });
      if (!referrer) {
        return res.status(400).json({ success: false, message: "Invalid referral code" });
      }
    }

    // Create a new user
    const newUser = {
      firstName,
      lastName,
      email,
      password: hashPassword(password),
      country,
      amountDeposited: 0,
      profit: 0,
      balance: 0,
      referalBonus: 0,
      transactions: [],
      withdrawals: [],
      accounts: { eth: { address: "" }, ltc: { address: "" }, btc: { address: "" }, usdt: { address: "" } },
      verified: false,
      isDisabled: false,
      referredUsers: [],
      referralCode: generateReferralCode(),
      referredBy: referrer ? referrer._id : null,
    };

    // Save the new user to the database
    const createdUser = await UsersDatabase.create(newUser);

    // Update the referrer with the new user's ID
    if (referrer) {
      referrer.referredUsers.push(createdUser._id);
      await referrer.save();
    }

    // Send a welcome email with a token
    const token = uuidv4();
    sendWelcomeEmail({ to: email, token });

    res.status(200).json({ success: true, data: createdUser });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Resend welcome email route
router.post("/register/resend", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UsersDatabase.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    resendWelcomeEmail({ to: email });
    res.status(200).json({ success: true, message: "Welcome email resent successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Reset email route
router.post("/register/reset", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UsersDatabase.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    resetEmail({ to: email });
    res.status(200).json({ success: true, message: "Reset email sent successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Verify OTP route
router.post("/register/otp", async (req, res) => {
  const { email, password, firstName } = req.body;

  try {
    const user = await UsersDatabase.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    sendUserDetails({ to: email, password, firstName });
    res.status(200).json({ success: true, message: "OTP verified and user details sent" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
