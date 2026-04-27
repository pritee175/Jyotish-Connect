// Vercel Serverless Function for creating Razorpay orders
const Razorpay = require('razorpay')

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  try {
    const { queryId, amount } = req.body
    
    if (!queryId || !amount) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    
    // Initialize Razorpay with your keys
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    })
    
    // Create order
    const options = {
      amount: amount, // amount in paise
      currency: 'INR',
      receipt: `query_${queryId}`,
      notes: {
        queryId: queryId
      }
    }
    
    const order = await razorpay.orders.create(options)
    
    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return res.status(500).json({ 
      error: 'Failed to create order',
      message: error.message 
    })
  }
}
