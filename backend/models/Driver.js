// models/Driver.js

const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  status: { // e.g., Active, Offline
    type: String,
    enum: ['Active', 'Offline'],
    default: 'Offline',
  },
  currentLocation: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
  },
  vehicle: {
    type: String, // e.g., "Tesla Model 3"
    required: false,
  },
  licensePlate: {
    type: String,
    required: false,
    unique: true,
    sparse : true
  },
  // Add more fields as needed
}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);
