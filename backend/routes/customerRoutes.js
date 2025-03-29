// routes/customers.js

const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// @route   POST /api/customers
// @desc    Create a new customer
// @access  Public (Change to Private with Auth in production)
router.post('/', async (req, res) => {
  try {
    const { name, mobile, address } = req.body;
    const newCustomer = new Customer({ name, mobile, address });
    const savedCustomer = await newCustomer.save();
    res.status(201).json(savedCustomer);
  } catch (error) {
    console.error('Error creating customer:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/customers
// @desc    Get all customers
// @access  Public
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/customers/:id
// @desc    Get a customer by ID
// @access  Public
router.get('/:c_id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.c_id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/customers/:id
// @desc    Update a customer by ID
// @access  Public
router.put('/:c_id', async (req, res) => {
  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.c_id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedCustomer) return res.status(404).json({ message: 'Customer not found' });
    res.json(updatedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/customers/:id
// @desc    Delete a customer by ID
// @access  Public
router.delete('/:c_id', async (req, res) => {
  try {
    const deletedCustomer = await Customer.findByIdAndDelete(req.params.c_id);
    if (!deletedCustomer) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
