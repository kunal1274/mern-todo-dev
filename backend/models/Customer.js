// models/Customer.js

const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
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
    unique : true,
    sparse: true
    
  },
  // Add more fields as needed
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
