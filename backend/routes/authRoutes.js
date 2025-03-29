// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const nodemailer = require('nodemailer');
const Otp = require('../models/Otp');
const generateOtp = require('../utils/generateOtp'); // Import the OTP generator
// const { check, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

// Twilio Configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;
const smsFrom = process.env.TWILIO_SMS_NUMBER; // Add your Twilio SMS number
const client = twilio(accountSid, authToken);

// // Log the environment variables to verify they are loaded
// console.log("EMAIL_USER:", process.env.EMAIL_USER);
// console.log("EMAIL_PASS:", process.env.EMAIL_PASS);

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

// // Rate Limiter for OTP Requests (e.g., max 5 per hour per identifier)
// const otpRequestLimiter = rateLimit({
//   windowMs: 60 * 60 * 1000, // 1 hour
//   max: 30,
//   keyGenerator: (req) => {
//     return req.body.phoneNumber || req.body.email;
//   },
//   handler: (req, res) => {
//     logger.warn(`Rate limit exceeded for identifier: ${req.body.phoneNumber || req.body.email}`);
//     return res.status(429).json({ msg: 'Too many OTP requests. Please try again later.' });
//   },
// });


// Generate and Send OTP
router.post('/send-otp',
   async (req, res) => {
  const { phoneNumber, email, method, otpType, otpLength } = req.body;
  // console.log("Request Data:", { phoneNumber, email, method, otpType, otpLength });
  //logger.info("Request Data:", { phoneNumber, email, method, otpType, otpLength });

 

  // Validation
  if (!method || (!phoneNumber && !email)) {
    console.log(`Missing identifier or method: phoneNumber=${phoneNumber}, email=${email}, method=${method}`);
    return res.status(400).json({ msg: 'Phone number or email is required, and method must be specified' });
  }

  if (!['whatsapp', 'sms', 'email'].includes(method)) {
    return res.status(400).json({ msg: 'Invalid method. Choose from whatsapp, sms, or email.' });
  }

  if (otpType && !['numeric', 'alphanumeric', 'alphanumeric_special'].includes(otpType)) {
    return res.status(400).json({ msg: 'Invalid OTP type. Choose from numeric, alphanumeric, or alphanumeric_special.' });
  }

  const finalOtpType = otpType || 'numeric';
  const finalOtpLength = otpLength || 6;

  // Generate OTP
  const otp = generateOtp(finalOtpType, finalOtpLength);
  console.log("Generated OTP:", otp);

  try {
    let query = { otp };

    if ((method === "whatsapp" || method ==="sms") && phoneNumber) {
      query.phoneNumber = phoneNumber;
    }

    if (method ==="email" && email) {
      query.email = email;
    }

    const otpRecord = await Otp.findOneAndDelete(query)
    
    
    // Save OTP to the database
    await Otp.create({
      phoneNumber: phoneNumber || null,
      email: email || null,
      otp,
      method,
      otpType: finalOtpType,
    });
    console.log("OTP saved to database");

    // Send OTP based on the method
    if (method === 'whatsapp' && phoneNumber) {
      // Send via WhatsApp
      await client.messages.create({
        body: `Your OTP is: ${otp}`,
        from: whatsappFrom,
        to: `whatsapp:${phoneNumber}`,
      });
      console.log("OTP sent via WhatsApp");
      return res.status(200).json({ msg: 'OTP sent via WhatsApp successfully' });
    } else if (method === 'sms' && phoneNumber) {
      // Send via SMS
      await client.messages.create({
        body: `Your OTP is: ${otp}`,
        from: smsFrom,
        to: phoneNumber,
      });
      console.log("OTP sent via SMS");
      return res.status(200).json({ msg: 'OTP sent via SMS successfully' });
    } else if (method === 'email' && email) {
      // Send via Email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'muushakaH : Your OTP Code',
        text: `Welcome to Aum muushakaH . Your OTP is: ${otp}`,
        html: `<b>muushakaH : Your OTP is: ${otp}</b>`,
      };

      await transporter.sendMail(mailOptions);

      console.log("OTP sent via Email");
      console.log("last otp record which has been deleted",otpRecord);
      return res.status(200).json({ msg: 'OTP sent via email successfully' });
    } else {
      return res.status(400).json({ msg: 'Invalid method or missing phone number/email' });
    }
  } catch (err) {
    console.error("Error in /send-otp:", err);
    return res.status(500).json({ msg: 'Server Error' });
  }

  
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { phoneNumber, email, otp } = req.body;
  console.log("Verify Request Data:", { phoneNumber, email, otp });

  if ((!phoneNumber && !email) || !otp) {
    return res.status(400).json({ msg: 'Phone number or email and OTP are required' });
  }

  try {
    // Find the OTP document based on method
    let query = { otp };

    if (phoneNumber) {
      query.phoneNumber = phoneNumber;
    }

    if (email) {
      query.email = email;
    }

    const otpRecord = await Otp.findOne(query);

    if (!otpRecord) {
      return res.status(400).json({ msg: 'Invalid or expired OTP' });
    }

    // Check if OTP is expired
    if (otpRecord.expiresAt < Date.now()) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ msg: 'OTP has expired' });
    }

    // OTP is valid, proceed with user creation or login
    // For demonstration, we'll just delete the OTP and send success
    await Otp.deleteOne({ _id: otpRecord._id });

    // TODO: Implement user creation or authentication logic here

    return res.status(200).json({ msg: 'OTP verified successfully' });
  } catch (err) {
    console.error("Error in /verify-otp:", err);
    return res.status(500).json({ msg: 'Server Error' });
  }
});






module.exports = router;
