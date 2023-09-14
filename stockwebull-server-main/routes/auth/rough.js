const users = [];



// Define a user object with a referral property

const user = {

  id: 1,

  name: "John Doe",

  referral: {

    code: generateReferralCode(6), // Generate a referral code for the referrer

    referredUsers: [], // Store referred users

  },

};



// Function to generate referral code

function generateReferralCode(length) {

  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let code = "";



  for (let i = 0; i < length; i++) {

    const randomIndex = Math.floor(Math.random() * characters.length);

    code += characters.charAt(randomIndex);

  }



  return code;

}



// Function to add a referred user to the referrer's referral property

function addReferredUser(referrer, referredUser) {

  referrer.referral.referredUsers.push(referredUser);

}



// Simulate a new user signing up with a referral code

function signUpWithReferralCode(newUser, referrerCode) {

  const referrer = users.find((u) => u.referral.code === referrerCode);



  if (referrer) {

    // Add the new user to the referrer's referredUsers array

    addReferredUser(referrer, newUser);

    console.log(`User ${newUser.name} signed up with referral code from ${referrer.name}`);

  } else {

    console.log("Invalid referral code.");

  }

}



// Simulate adding users to the system

users.push(user);



// Example: A new user signs up with a referral code

const newUser = {

  id: 2,

  name: "Alice",

};



signUpWithReferralCode(newUser, user.referral.code);



// Check the referrer's referredUsers property

console.log(`${user.name}'s referred users:`, user.referral.referredUsers);


//backend
const express = require('express');

const app = express();

const port = 3000;



const users = [];



// Define a user object with a referral property

const user = {

  id: 1,

  name: "John Doe",

  referral: {

    code: generateReferralCode(6), // Generate a referral code for the referrer

    referredUsers: [], // Store referred users

  },

};



// Function to generate referral code

function generateReferralCode(length) {

  // ... (same as previous code)

}



// Function to add a referred user to the referrer's referral property

function addReferredUser(referrer, referredUser) {

  // ... (same as previous code)

}



// Middleware to parse JSON in request body

app.use(express.json());



// Endpoint to sign up with a referral code

app.post('/signup', (req, res) => {

  const { name, referrerCode } = req.body;



  const newUser = {

    id: users.length + 1,

    name,

  };



  // Find the referrer based on the provided referral code

  const referrer = users.find((u) => u.referral.code === referrerCode);



  if (referrer) {

    // Add the new user to the referrer's referredUsers array

    addReferredUser(referrer, newUser);

    users.push(newUser);

    res.status(200).json({ message: `User ${name} signed up with referral code from ${referrer.name}` });

  } else {

    res.status(400).json({ message: "Invalid referral code." });

  }

});



app.listen(port, () => {

  console.log(`Server is running on port ${port}`);

});