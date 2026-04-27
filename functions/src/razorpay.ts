import * as functions from 'firebase-functions'
import Razorpay from 'razorpay'
import crypto from 'crypto'

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: functions.config().razorpay?.key_id || process.env.RAZORPAY_KEY_ID || '',
  key_secret: functions.config().razorpay?.key_secret || process.env.RAZORPAY_KEY_SECRET || ''
})

// Create Razorpay order
export const createOrder = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'POST')
  res.set('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  
  try {
    const { queryId, amount } = req.body // amount in paise
    
    if (!queryId || !amount) {
      res.status(400).json({ error: 'Missing required fields' })
      return
    }
    
    const options = {
      amount: amount, // amount in paise
      currency: 'INR',
      receipt: `query_${queryId}`,
      notes: {
        queryId: queryId
      }
    }
    
    const order = await razorpay.orders.create(options)
    
    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    })
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error)
    res.status(500).json({ 
      error: 'Failed to create order',
      message: error.message 
    })
  }
})

// Verify payment signature
export const verifyPayment = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'POST')
  res.set('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  
  try {
    const { paymentId, orderId, signature } = req.body
    
    if (!paymentId || !orderId || !signature) {
      res.status(400).json({ error: 'Missing required fields' })
      return
    }
    
    // Verify signature
    const keySecret = functions.config().razorpay?.key_secret || process.env.RAZORPAY_KEY_SECRET || ''
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex')
    
    const isValid = generatedSignature === signature
    
    if (isValid) {
      res.status(200).json({ 
        verified: true,
        message: 'Payment verified successfully'
      })
    } else {
      res.status(400).json({ 
        verified: false,
        message: 'Invalid signature'
      })
    }
  } catch (error: any) {
    console.error('Error verifying payment:', error)
    res.status(500).json({ 
      error: 'Verification failed',
      message: error.message 
    })
  }
})

// Get payment details
export const getPaymentDetails = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET')
  res.set('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return
  }
  
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  
  try {
    const paymentId = req.query.paymentId as string
    
    if (!paymentId) {
      res.status(400).json({ error: 'Payment ID required' })
      return
    }
    
    const payment = await razorpay.payments.fetch(paymentId)
    
    res.status(200).json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        email: payment.email,
        contact: payment.contact,
        createdAt: payment.created_at
      }
    })
  } catch (error: any) {
    console.error('Error fetching payment:', error)
    res.status(500).json({ 
      error: 'Failed to fetch payment',
      message: error.message 
    })
  }
})

// Refund payment
export const refundPayment = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'POST')
  res.set('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  
  try {
    const { paymentId, amount } = req.body
    
    if (!paymentId) {
      res.status(400).json({ error: 'Payment ID required' })
      return
    }
    
    const refundOptions: any = {}
    if (amount) {
      refundOptions.amount = amount // Partial refund
    }
    
    const refund = await razorpay.payments.refund(paymentId, refundOptions)
    
    res.status(200).json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount,
        status: refund.status,
        createdAt: refund.created_at
      }
    })
  } catch (error: any) {
    console.error('Error processing refund:', error)
    res.status(500).json({ 
      error: 'Refund failed',
      message: error.message 
    })
  }
})

// Webhook to handle payment events
export const razorpayWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  
  try {
    const webhookSecret = functions.config().razorpay?.webhook_secret || process.env.RAZORPAY_WEBHOOK_SECRET
    const signature = req.headers['x-razorpay-signature'] as string
    
    // Verify webhook signature
    if (webhookSecret) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex')
      
      if (signature !== expectedSignature) {
        res.status(400).json({ error: 'Invalid signature' })
        return
      }
    }
    
    const event = req.body.event
    const payload = req.body.payload.payment.entity
    
    console.log('Razorpay webhook event:', event)
    
    // Handle different events
    switch (event) {
      case 'payment.captured':
        // Payment successful
        console.log('Payment captured:', payload.id)
        // Update query status in Firestore
        break
        
      case 'payment.failed':
        // Payment failed
        console.log('Payment failed:', payload.id)
        break
        
      case 'refund.created':
        // Refund initiated
        console.log('Refund created:', payload.id)
        break
    }
    
    res.status(200).json({ success: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
})
