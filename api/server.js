const express = require('express');
const app = express();
app.use(express.json());

// --- Configuration via Environment Variables ---
const DB_HOST = process.env.DB_HOST || 'localhost';
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:8000';
const PAYMENT_URL = process.env.PAYMENT_URL || 'http://localhost:4000';
const API_PORT = process.env.API_PORT || 3000;
// ---

app.get('/health', (req, res) => res.send('API is healthy'));

// Example of integrating service data (e.g., fetching products from DB or another service)
app.get('/products', (req, res) => {
  console.log(`Attempting to connect to DB at: ${DB_HOST}`);
  
  // In a real app, you would fetch data from the DB here.
  // We'll simulate a response for this example:
  res.json([
    { id: 1, name: 'POS Terminal', price: 150000, source: `Connected via ${DB_HOST}` },
    { id: 2, name: 'QR Scanner', price: 80000, source: `Connected via ${DB_HOST}` }
  ]);
});

// Example of calling the Auth service (simplified)
app.get('/verify', async (req, res) => {
    // In a real app, this would be middleware.
    try {
        // Assume axios is installed and used here to hit the AUTH_URL/verify endpoint
        // const authResponse = await axios.get(`${AUTH_URL}/verify`, { headers: req.headers });
        res.send(`Auth service status URL: ${AUTH_URL}`);
    } catch (error) {
        res.status(500).send("Auth service connection error");
    }
});

app.listen(API_PORT, () => console.log(`StreamlinePay API running on port ${API_PORT}. DB Host: ${DB_HOST}`));