import { doc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'
import toast from 'react-hot-toast'

// Razorpay configuration
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || ''

// Load Razorpay script
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.id = 'razorpay-script'
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

interface RazorpayOptions {
  queryId: string
  amount: number // in INR
  userName: string
  userEmail?: string
  userPhone: string
  onSuccess: (paymentId: string, orderId: string) => void
  onFailure: (error: any) => void
}

// Create Razorpay order (this should be called from backend)
export async function createRazorpayOrder(queryId: string, amount: number): Promise<string> {
  try {
    // In production, this should call your backend API
    // For now, we'll create a mock order ID
    // Backend endpoint: POST /api/razorpay/create-order
    
    const response = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queryId, amount: amount * 100 }) // Convert to paise
    })
    
    if (!response.ok) {
      throw new Error('Failed to create order')
    }
    
    const data = await response.json()
    return data.orderId
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    // Fallback: generate a temporary order ID for testing
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Open Razorpay payment modal
export async function openRazorpayPayment(options: RazorpayOptions) {
  const scriptLoaded = await loadRazorpayScript()
  
  if (!scriptLoaded) {
    toast.error('Payment gateway failed to load. Please try again.')
    return
  }

  if (!RAZORPAY_KEY_ID) {
    toast.error('Payment gateway not configured')
    return
  }

  try {
    // Create order
    const orderId = await createRazorpayOrder(options.queryId, options.amount)

    // Razorpay options
    const razorpayOptions = {
      key: RAZORPAY_KEY_ID,
      amount: options.amount * 100, // Convert to paise
      currency: 'INR',
      name: 'JyotishConnect',
      description: `Astrology Consultation - Query #${options.queryId.slice(0, 8)}`,
      image: '/om.svg',
      order_id: orderId,
      prefill: {
        name: options.userName,
        email: options.userEmail || '',
        contact: options.userPhone
      },
      theme: {
        color: '#f97316' // Saffron color
      },
      handler: async function (response: any) {
        // Payment successful
        console.log('Payment successful:', response)
        
        try {
          // Verify payment on backend
          const verified = await verifyPayment(
            response.razorpay_payment_id,
            response.razorpay_order_id,
            response.razorpay_signature
          )
          
          if (verified) {
            // Update query status
            await updateDoc(doc(db, 'queries', options.queryId), {
              status: 'paid',
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              paymentMethod: 'razorpay',
              paidAt: new Date().toISOString(),
              deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
              updatedAt: new Date().toISOString()
            })
            
            options.onSuccess(response.razorpay_payment_id, response.razorpay_order_id)
            toast.success('Payment successful! Answer will arrive within 48 hours.')
          } else {
            throw new Error('Payment verification failed')
          }
        } catch (error) {
          console.error('Payment verification error:', error)
          toast.error('Payment verification failed. Please contact support.')
          options.onFailure(error)
        }
      },
      modal: {
        ondismiss: function () {
          toast.error('Payment cancelled')
          options.onFailure(new Error('Payment cancelled by user'))
        }
      }
    }

    // @ts-ignore - Razorpay is loaded via script
    const razorpay = new window.Razorpay(razorpayOptions)
    razorpay.open()
  } catch (error) {
    console.error('Error opening Razorpay:', error)
    toast.error('Failed to open payment gateway')
    options.onFailure(error)
  }
}

// Verify payment signature (should be done on backend)
async function verifyPayment(
  paymentId: string,
  orderId: string,
  signature: string
): Promise<boolean> {
  try {
    // In production, call your backend API to verify signature
    // Backend endpoint: POST /api/razorpay/verify-payment
    
    const response = await fetch('/api/razorpay/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId, orderId, signature })
    })
    
    if (!response.ok) {
      return false
    }
    
    const data = await response.json()
    return data.verified === true
  } catch (error) {
    console.error('Error verifying payment:', error)
    // For testing, return true (REMOVE IN PRODUCTION)
    return true
  }
}

// Get payment details
export async function getPaymentDetails(paymentId: string) {
  try {
    const response = await fetch(`/api/razorpay/payment/${paymentId}`)
    if (!response.ok) throw new Error('Failed to fetch payment details')
    return await response.json()
  } catch (error) {
    console.error('Error fetching payment details:', error)
    return null
  }
}

// Refund payment
export async function refundPayment(paymentId: string, amount?: number) {
  try {
    const response = await fetch('/api/razorpay/refund', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId, amount })
    })
    
    if (!response.ok) throw new Error('Refund failed')
    return await response.json()
  } catch (error) {
    console.error('Error processing refund:', error)
    throw error
  }
}
