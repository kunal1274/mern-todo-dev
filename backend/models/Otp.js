// models/Otp.js
const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: function() {
      return !this.email;
    },
  },
  email: {
    type: String,
    required: function() {
      return !this.phoneNumber;
    },
  },
  otp: {
    type: String,
    required: true,
  },
  method: {
    type: String,
    enum: ['whatsapp', 'sms', 'email'],
    required: true,
  },
  otpType: {
    type: String,
    enum: ['numeric', 'alphanumeric', 'alphanumeric_special'],
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => Date.now() + 10 * 60 * 1000, // OTP expires in 10 minutes
  },
}, { timestamps: true });

module.exports = mongoose.model('Otp', OtpSchema);
