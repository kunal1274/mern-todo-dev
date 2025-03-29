// routes/drivers.js

const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');

// @route   POST /api/drivers
// @desc    Create a new driver
// @access  Public (Change to Private with Auth in production)
router.post('/', async (req, res) => {
  try {
    const { name, vehicle, licensePlate } = req.body;
    const newDriver = new Driver({ name, vehicle, licensePlate });
    const savedDriver = await newDriver.save();
    res.status(201).json(savedDriver);
  } catch (error) {
    console.error('Error creating driver:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/drivers
// @desc    Get all drivers
// @access  Public
router.get('/', async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.json(drivers);
  } catch (error) {
    console.error('Error fetching drivers:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/drivers/:id
// @desc    Get a driver by ID
// @access  Public
router.get('/:d_id', async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.d_id);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json(driver);
  } catch (error) {
    console.error('Error fetching driver:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/drivers/:id
// @desc    Update a driver by ID
// @access  Public
router.put('/:d_id', async (req, res) => {
  try {
    const updatedDriver = await Driver.findByIdAndUpdate(
      req.params.d_id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedDriver) return res.status(404).json({ message: 'Driver not found' });
    res.json(updatedDriver);
  } catch (error) {
    console.error('Error updating driver:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/drivers/:id
// @desc    Delete a driver by ID
// @access  Public
router.delete('/:d_id', async (req, res) => {
  try {
    const deletedDriver = await Driver.findByIdAndDelete(req.params.d_id);
    if (!deletedDriver) return res.status(404).json({ message: 'Driver not found' });
    res.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    console.error('Error deleting driver:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
