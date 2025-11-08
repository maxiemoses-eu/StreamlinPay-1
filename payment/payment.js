const express = require('express');
const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.send('Payment service is healthy'));

app.post('/charge', (req, res) => {
  const { amount } = req.body;
  if (!amount) return res.status(400).send('Missing amount');
  res.send({ status: 'success', amount });
});

app.listen(4000, () => console.log('StreamlinePay payment service running on port 4000'));