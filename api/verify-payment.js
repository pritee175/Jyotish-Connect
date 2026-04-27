// Vercel Serverless Function for verifying Razorpay payments
const crypto = require('crypto')

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
    const { paymentId, orderId, signature } = req.body
    
    if (!paymentId || !orderId || !signature) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    
    // Verify signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex')
    
    const isValid = generatedSignature === signature
    
    if (isValid) {
      return res.status(200).json({ 
        verified: true,
        message: 'Payment verified successfully'
      })
    } else {
      return res.status(400).json({ 
        verified: false,
        message: 'Invalid signature'
      })
    }
  } catch (error) {
    console.error('Error verifying payment:', error)
    return res.status(500).json({ 
      error: 'Verification failed',
      message: error.message 
    })
  }
}
