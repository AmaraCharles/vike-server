const express = require("express");
const { hashPassword, sendWelcomeEmail, resendWelcomeEmail } = require("../../utils");
const UsersDatabase = require("../../models/User");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

// Function to generate a referral code
function generateReferralCode(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }

  return code;
}

router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password, country, referralCode } = req.body;

  try {
    // Check if any user has that email
    const user = await UsersDatabase.findOne({ email });

    if (user) {
      return res.status(400).json({
        success: false,
        message: "Email address is already taken",
      });
    }

    // Find the referrer based on the provided referral code
    let referrer = null;
    if (referralCode) {
      referrer = await UsersDatabase.findOne({ referralCode });
      if (!referrer) {
        return res.status(400).json({
          success: false,
          message: "Invalid referral code",
        });
      }
    }

    // Create a new user with referral information
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
      accounts: {
        eth: {
          address: "",
        },
        ltc: {
          address: "",
        },
        btc: {
          address: "",
        },
        usdt: {
          address: "",
        },
      },
      verified: false,
      isDisabled: false,
      referralCode: generateReferralCode(6), // Generate a referral code for the new user
      referredBy: referrer ? referrer._id : null, // Store the ID of the referrer if applicable
    };

    // Create the new user in the database
    const createdUser = await UsersDatabase.create(newUser);
    const token = uuidv4();
    sendWelcomeEmail({ to: email, token });

    // If there's a referrer, update their referredUsers list
    if (referrer) {
      referrer.referredUsers.push(createdUser._id);
      await referrer.save();
    }

    return res.status(200).json({ code: "Ok", data: createdUser });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
