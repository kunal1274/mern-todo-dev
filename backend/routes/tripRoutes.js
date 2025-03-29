// routes/trips.js

const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const Driver = require('../models/Driver');
const Customer = require('../models/Customer');

// @route   POST /api/trips
// @desc    Create a new trip
// @access  Public (Change to Private with Auth in production)
router.post('/', async (req, res) => {
  try {
    const { driverId, customerId, startLocation, endLocation } = req.body;

    // Validate driver and customer existence
    const driver = await Driver.findById(driverId);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const newTrip = new Trip({
      driver: driverId,
      customer: customerId,
      startLocation,
      endLocation,
      currentLocation: startLocation.coordinates, // Initially at start
    });

    const savedTrip = await newTrip.save();
    res.status(201).json(savedTrip);
  } catch (error) {
    console.error('Error creating trip:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/trips
// @desc    Get all trips
// @access  Public
router.get('/', async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate('driver')
      .populate('customer');
    res.json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/trips/:id
// @desc    Get a trip by ID
// @access  Public
router.get('/:t_id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.t_id)
      .populate('driver')
      .populate('customer');
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (error) {
    console.error('Error fetching trip:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/trips/:id
// @desc    Update a trip by ID (e.g., update car position or status)
// @access  Public
router.put('/:t_id', async (req, res) => {
  try {
    const updatedTrip = await Trip.findByIdAndUpdate(
      req.params.t_id,
      req.body,
      { new: true, runValidators: true }
    ).populate('driver').populate('customer');

    if (!updatedTrip) return res.status(404).json({ message: 'Trip not found' });
    res.json(updatedTrip);
  } catch (error) {
    console.error('Error updating trip:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/trips/:id
// @desc    Delete a trip by ID
// @access  Public
router.delete('/:t_id', async (req, res) => {
  try {
    const deletedTrip = await Trip.findByIdAndDelete(req.params.t_id);
    if (!deletedTrip) return res.status(404).json({ message: 'Trip not found' });
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Error deleting trip:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
