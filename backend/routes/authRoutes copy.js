// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const Otp = require('../models/Otp');

// Environment Variables
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
//const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST; //'getotp-co-send-otps-via-whatsapp-globally-for-free.p.rapidapi.com';
const RAPIDAPI_HOST = 'getotp-co-send-otps-via-whatsapp-globally-for-free.p.rapidapi.com';

// Generate and Send OTP
router.post('/send-otp', async (req, res) => {
  const { phoneNumber } = req.body;
  console.log(phoneNumber)

  if (!phoneNumber) {
    return res.status(400).json({ msg: 'Phone number is required' });
  }

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(otp)

  try {
    // Save OTP to the database
    await Otp.create({ phoneNumber, otp });

    // Send OTP via RapidAPI
    const options = {
      method: 'GET',
      url: 'https://getotp-co-send-otps-via-whatsapp-globally-for-free.p.rapidapi.com/api',
      params: {
        key: RAPIDAPI_KEY,
        otp: otp,
        to: phoneNumber,
      },
      headers: {
        'x-rapidapi-host': RAPIDAPI_HOST,
        'x-rapidapi-key': RAPIDAPI_KEY,
      },
    };

    const response = await axios.request(options);
    console.log(response)

    if (response.status === 200) {
      return res.status(200).json({ msg: 'OTP sent successfully' });
    } else {
      return res.status(500).json({ msg: 'Failed to send OTP' });
    }
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: 'Server Error' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) {
    return res.status(400).json({ msg: 'Phone number and OTP are required' });
  }

  try {
    // Find the OTP document
    const otpRecord = await Otp.findOne({ phoneNumber, otp });

    if (!otpRecord) {
      return res.status(400).json({ msg: 'Invalid or expired OTP' });
    }

    // OTP is valid, proceed with user creation or login
    // For demonstration, we'll just delete the OTP and send success
    await Otp.deleteOne({ _id: otpRecord._id });

    // TODO: Implement user creation or authentication logic here

    return res.status(200).json({ msg: 'OTP verified successfully' });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
