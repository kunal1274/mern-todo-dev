// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const nodemailer = require('nodemailer');
const Otp = require('../models/Otp');
// No need to require dotenv here if already loaded in server.js

// Twilio Configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;
const client = twilio(accountSid, authToken);

// Email Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Your Gmail App Password
  },
  debug: true, // Enable debug output
  logger: true, // Log SMTP traffic
});

// Generate and Send OTP
router.post('/send-otp', async (req, res) => {
  const { phoneNumber, email, method } = req.body;
  console.log("Request Data:", { phoneNumber, email, method });

  if (!method || (!phoneNumber && !email)) {
    return res.status(400).json({ msg: 'Phone number or email is required, and method must be specified' });
  }

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log("Generated OTP:", otp);

  try {
    // Save OTP to the database
    await Otp.create({ phoneNumber, email, otp });
    console.log("OTP saved to database");

    if (method === 'whatsapp' && phoneNumber) {
      // Send OTP via WhatsApp
      await client.messages.create({
        body: `Your OTP is: ${otp}`,
        from: whatsappFrom,
        to: `whatsapp:${phoneNumber}`,
      });
      console.log("OTP sent via WhatsApp");
      return res.status(200).json({ msg: 'OTP sent via WhatsApp successfully' });
    } else if (method === 'email' && email) {
      // Send OTP via Email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP is: ${otp}`,
        html: `<b>Your OTP is: ${otp}</b>`,
      };

      await transporter.sendMail(mailOptions);
      console.log("OTP sent via Email");
      return res.status(200).json({ msg: 'OTP sent via email successfully' });
    } else {
      return res.status(400).json({ msg: 'Invalid method or missing phone number/email' });
    }
  } catch (err) {
    console.error("Error in /send-otp:", err);
    return res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
