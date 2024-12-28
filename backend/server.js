const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');  
const authRoutes = require('./routes/authRoutes');
const app = express();
const PORT = 5000;

// Load environment variables from .env file
require('dotenv').config();

// Use the connection string from .env file
const DB_URI = process.env.MONGODB_URI;


// Enable cross-origin resource sharing (CORS) to allow requests from a different origin (e.g. the frontend)
app.use(cors());

// Parse the request body as JSON
app.use(bodyParser.json());

// Connect to the MongoDB database using the connection string from the .env file
mongoose.connect(DB_URI).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Failed to connect to MongoDB', err);
});

// Mount the auth routes at the root path ('/')
app.use('/', authRoutes);

// Start the server and listen on the specified port
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
