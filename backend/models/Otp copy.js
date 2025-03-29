// backend/models/Otp.js
const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // OTP expires after 5 minutes
  },
},
{
    timestamps : true
}
);

module.exports = mongoose.model('Otp', OtpSchema);
