const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files from the current directory
app.use(express.static(__dirname));

// Handle requests to the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Proxy route for Airtable API requests
app.get('/api/twitter-highlights', async (req, res) => {
  try {
    const API_KEY = process.env.AIRTABLE_API_KEY;
    const BASE_ID = process.env.AIRTABLE_BASE_ID;
    const TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;

    const response = await axios.get(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`
      },
      params: {
        filterByFormula: "OR({Type}='SREF',{Type}='Video')"
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Airtable API request failed:', error);
    res.status(500).json({ error: 'An error occurred while fetching data from Airtable' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});