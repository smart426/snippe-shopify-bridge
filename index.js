require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Shopify inatuma order hapa
app.post('/shopify/orders', async (req, res) => {
  const order = req.body;
  
  try {
    const phone = order.shipping_address?.phone || 
                  order.billing_address?.phone;
    const amount = order.total_price;
    const currency = order.currency;
    const orderName = order.name;

    // Tuma malipo kupitia Snippe
    const response = await axios.post(
      'https://api.snippe.sh/v1/payments',
      {
        phone: phone,
        amount: amount,
        currency: currency,
        reference: orderName,
        description: `Malipo ya order ${orderName}`
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.SNIPPE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Malipo yametumwa:', response.data);
    res.json({ success: true, data: response.data });

  } catch (error) {
    console.error('Kosa:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Snippe inatuma taarifa ya malipo hapa
app.post('/snippe/webhook', (req, res) => {
  const event = req.body;
  console.log('Snippe webhook:', event);
  res.json({ success: true, message: `Event ${event.event} received and acknowledged` });
});

app.get('/', (req, res) => {
  res.json({ message: 'Snippe-Shopify Bridge inafanya kazi!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server inaendesha kwenye port ${PORT}`);
});
