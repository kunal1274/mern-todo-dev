// models/Trip.js

const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  driverVehicle: {
    type: String, // e.g., "Tesla Model 3"
    required: false,
  },
  driverLicensePlate: {
    type: String,
    required: false,
    unique : true,
    sparse: true
    
  },
  customerVehicle: {
    type: String, // e.g., "Tesla Model 4"
    required: false,
  },
  customerLicensePlate: {
    type: String,
    required: false,
    unique : true,
    sparse: true
    
  },
  startLocation: {
    address: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
  },
  endLocation: {
    address: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
  },
  currentLocation: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
  },
  distance: {
    type: Number, // Distance in kilometers
    default: 0,
  },
  duration: {
    type: Number, // Duration in minutes
    default: 0,
  },
  cost: {
    type: Number, // Cost in Rs.
    default: 0,
  },
  slot: {
    type: Number, // Slot in hours
    default: 2, // Default slot is 2 hours
  },
  status: { // e.g., Pending, Ongoing, Completed, Cancelled
    type: String,
    enum: ['Pending', 'Stopped','Paused','Ongoing', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
  // Add more fields as needed
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);
