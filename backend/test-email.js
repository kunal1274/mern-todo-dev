// testEmail.js
const nodemailer = require('nodemailer');
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Log the environment variables to verify they are loaded
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS);

// Check if environment variables are loaded
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("ERROR: EMAIL_USER and/or EMAIL_PASS are not defined in the .env file.");
  process.exit(1); // Exit the script with an error code
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Your Gmail App Password
  },
  debug: true, // Enable debug output
  logger: true, // Log SMTP traffic
});

const mailOptions = {
  from: process.env.EMAIL_USER,
  to: 'kunalratxen@gmail.com', // Replace with a valid recipient email
  subject: 'Test Email from Nodemailer',
  text: 'This is a test email sent using Nodemailer.',
  html: '<b>This is a test email sent using Nodemailer.</b>',
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.error("Error sending test email:", error);
  }
  console.log('Test Email sent:', info.response);
});
