const dotenv = require("dotenv");

// Load environment variables dynamically
const envFile = `.env.${process.env.NODE_ENV || "development1"}`;
dotenv.config({ path: envFile });
// dotenv.config();

// // Temporary logs to verify environment variables (remove in production)
// console.log("EMAIL_USER:", process.env.EMAIL_USER);
// console.log("EMAIL_PASS:", process.env.EMAIL_PASS);

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
// const fs = require('fs');
// const https = require('https');
// const helmet = require('helmet');
// const morgan = require('morgan'); // Optional: HTTP request logging
// const logger = require('./utils/logger');
// const loggerMiddleware = require('./middleware/loggerMiddleware');
const testRoutes = require("./routes/testRoutes");
const userRoutes = require("./routes/userRoutes");
const userGroupRoutes = require("./routes/userGroupRoutes");
const tagRoutes = require("./routes/tagRoutes");
const cors = require("cors"); // Ensure CORS is imported
const authRoutes = require("./routes/authRoutes");
const axios = require("axios");
const driverRoutes = require("./routes/driverRoutes");
const customerRoutes = require("./routes/customerRoutes");
const tripRoutes = require("./routes/tripRoutes");

const app = express();
const PORT = process.env.PORT || 5000; // currently its running on 5001 which is tied up with ngrok.

// Middleware
// app.use(helmet());
app.use(express.json());
// app.use(cors());
const corsOptions = {
  origin: (origin, callback) => {
    let allowedOrigins = [];

    // Dynamically set allowed origins based on the environment
    if (process.env.NODE_ENV === "development1") {
      allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://reliably-moving-dog.ngrok-free.app",
      ];
    } else if (process.env.NODE_ENV === "test") {
      allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:4000",
        "https://reliably-moving-dog.ngrok-free.app",
      ];
    } else if (process.env.NODE_ENV === "production") {
      allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:5050",
        "https://reliably-moving-dog.ngrok-free.app",
      ];
    } else {
      allowedOrigins = [
        "http://localhost:5173",
        "https://reliably-moving-dog.ngrok-free.app",
      ];
    }

    // Handle cases where origin might be undefined (e.g., server-side tools)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Allow credentials like cookies
};

// Apply CORS middleware with options
app.use(cors(corsOptions));

// Use Winston-based logging middleware
// app.use(loggerMiddleware);

// // Optionally, use Morgan and redirect logs to Winston
// app.use(morgan('combined', {
//   stream: {
//     write: (message) => logger.info(message.trim())
//   }
// }));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    console.log(
      "MongoDB connected for muushakaH (Test Management) app with gajaH (Map)"
    )
  )
  .catch((err) => console.log(`MongoDB connection error: ${err}`));

app.use((req, res, next) => {
  console.log(
    `Incoming request: ${req.method} ${req.originalUrl} from origin: ${req.headers.origin}`
  );
  next();
});

// API Routes
app.get("/api", (req, res) => {
  res.status(200).send({
    backendMessage:
      "Hello from the backend mmuushakaH (Test Management) with gajaH (Map)",
  });
});

// API Routes
app.get("/api", (req, res) => {
  res.status(200).send({
    backendMessage:
      "Hello from the backend muushakaH (Test Management) with gajaH (Map)",
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tests", testRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/tags", tagRoutes);
app.use("/api/v1/user-groups", userGroupRoutes);
app.use("/api/v1/drivers", driverRoutes);
app.use("/api/v1/customers", customerRoutes);
app.use("/api/v1/trips", tripRoutes);

// 404 Handler for Undefined API Routes
/**
 * Purpose: Catches any requests that start with /api/ but don't match existing API routes.
Response: Sends a JSON response with a 404 status code indicating the API route was not found.
 */
app.use("/api/*", (req, res) => {
  res.status(404).json({ message: "API route not found from the backend" });
});

// Serve static assets if in production
/**
 * Purpose: Serves the React frontend for any routes not starting with /api.
Behavior: Allows React Router to handle frontend routing without interfering with backend API routes.
 * 
 */
if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "..", "client", "dist");
  app.use(
    express.static(buildPath)
    // ,{
    //   maxAge: '1y',
    //   etag: false,
    // }
  );
  app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
} else {
  // For development, you might have a different setup or CORS
  app.get("/", (req, res) => {
    res.send("API is running in development mode...");
  });
}

// General 404 Handler (Optional)
/**
 * Purpose: Catches all other undefined routes not handled by API or frontend.
Response: Sends a plain text 404 message. You can customize this to serve a specific 404 page if desired.
 * 
 */
app.use((req, res, next) => {
  res
    .status(404)
    .send("404 Not Found from the backend. This is production server.");
});

app.listen(PORT, () => {
  console.log(
    `Server running muushakaH (Test Mgt) with gajaH (Map Mgt) at port num ${PORT}. This is production server.`
  );
});

// HTTPS Server Setup (for development)
// if (process.env.NODE_ENV === 'development') {
//   const sslOptions = {
//     key: fs.readFileSync(path.join(__dirname, 'certificates', 'key.pem')),
//     cert: fs.readFileSync(path.join(__dirname, 'certificates', 'cert.pem')),
//   };

//   https.createServer(sslOptions, app).listen(PORT, () => {
//     logger.info(`HTTPS Server running on port ${PORT}`);
//   });
// } else {
//   // In production, assume HTTPS is handled by a reverse proxy like Nginx
//   app.listen(PORT, () => {
//     logger.info(`HTTP Server running on port ${PORT}`);
//   });
// }
