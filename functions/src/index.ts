import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp()

// Export Razorpay functions
export { createOrder, verifyPayment, getPaymentDetails, refundPayment, razorpayWebhook } from './razorpay'

// Send notification when fee is set
export const onFeeSet = functions.firestore
  .document('queries/{queryId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data()
    const after = change.after.data()
    
    // Check if status changed to fee_set
    if (before.status !== 'fee_set' && after.status === 'fee_set') {
      const userId = after.userId
      const fee = after.fee
      
      // Get user's FCM token
      const userDoc = await admin.firestore().doc(`users/${userId}`).get()
      const fcmToken = userDoc.data()?.fcmToken
      
      if (fcmToken) {
        const message = {
          notification: {
            title: '💰 Fee Set for Your Query',
            body: `Consultation fee: ₹${fee}. Please proceed with payment.`
          },
          data: {
            type: 'fee_set',
            queryId: context.params.queryId,
            fee: fee.toString()
          },
          token: fcmToken
        }
        
        try {
          await admin.messaging().send(message)
          console.log('Fee set notification sent to user:', userId)
        } catch (error) {
          console.error('Error sending notification:', error)
        }
      }
    }
  })

// Send notification when payment is received
export const onPaymentReceived = functions.firestore
  .document('queries/{queryId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data()
    const after = change.after.data()
    
    // Check if status changed to paid
    if (before.status !== 'paid' && after.status === 'paid') {
      const userId = after.userId
      
      // Notify customer
      const userDoc = await admin.firestore().doc(`users/${userId}`).get()
      const fcmToken = userDoc.data()?.fcmToken
      
      if (fcmToken) {
        const message = {
          notification: {
            title: '✅ Payment Received!',
            body: 'Your payment has been confirmed. Answer will arrive within 48 hours.'
          },
          data: {
            type: 'payment_received',
            queryId: context.params.queryId
          },
          token: fcmToken
        }
        
        try {
          await admin.messaging().send(message)
          console.log('Payment confirmation sent to user:', userId)
        } catch (error) {
          console.error('Error sending notification:', error)
        }
      }
      
      // Notify admin about new paid query
      await notifyAdmin('new_paid_query', {
        title: '💰 New Paid Query',
        body: `${after.userName} has paid ₹${after.fee}. Answer within 48h!`,
        queryId: context.params.queryId
      })
    }
  })

// Send notification when answer is ready
export const onAnswerReady = functions.firestore
  .document('queries/{queryId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data()
    const after = change.after.data()
    
    // Check if status changed to answered
    if (before.status !== 'answered' && after.status === 'answered') {
      const userId = after.userId
      
      // Get user's FCM token
      const userDoc = await admin.firestore().doc(`users/${userId}`).get()
      const fcmToken = userDoc.data()?.fcmToken
      
      if (fcmToken) {
        const message = {
          notification: {
            title: '✨ Your Answer is Ready!',
            body: 'Your astrology consultation answer has been delivered. Tap to view.'
          },
          data: {
            type: 'answer_ready',
            queryId: context.params.queryId
          },
          token: fcmToken
        }
        
        try {
          await admin.messaging().send(message)
          console.log('Answer ready notification sent to user:', userId)
        } catch (error) {
          console.error('Error sending notification:', error)
        }
      }
    }
  })

// Send notification for new query to admin
export const onNewQuery = functions.firestore
  .document('queries/{queryId}')
  .onCreate(async (snap, context) => {
    const query = snap.data()
    
    await notifyAdmin('new_query', {
      title: '🆕 New Query Received',
      body: `${query.userName} submitted a ${query.domain} query. Review now!`,
      queryId: context.params.queryId
    })
  })

// Send notification for clarification
export const onClarificationNeeded = functions.firestore
  .document('queries/{queryId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data()
    const after = change.after.data()
    
    // Check if status changed to clarification
    if (before.status !== 'clarification' && after.status === 'clarification') {
      const userId = after.userId
      
      // Get user's FCM token
      const userDoc = await admin.firestore().doc(`users/${userId}`).get()
      const fcmToken = userDoc.data()?.fcmToken
      
      if (fcmToken) {
        const message = {
          notification: {
            title: '💬 Clarification Needed',
            body: 'The astrologer needs more information. Please respond.'
          },
          data: {
            type: 'clarification_needed',
            queryId: context.params.queryId
          },
          token: fcmToken
        }
        
        try {
          await admin.messaging().send(message)
          console.log('Clarification notification sent to user:', userId)
        } catch (error) {
          console.error('Error sending notification:', error)
        }
      }
    }
  })

// Payment reminder (scheduled function - runs daily)
export const sendPaymentReminders = functions.pubsub
  .schedule('every day 10:00')
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    // Find queries with fee_set status older than 24h
    const queries = await admin.firestore()
      .collection('queries')
      .where('status', '==', 'fee_set')
      .where('updatedAt', '<', yesterday.toISOString())
      .get()
    
    for (const doc of queries.docs) {
      const query = doc.data()
      const userId = query.userId
      
      // Get user's FCM token
      const userDoc = await admin.firestore().doc(`users/${userId}`).get()
      const fcmToken = userDoc.data()?.fcmToken
      
      if (fcmToken) {
        const message = {
          notification: {
            title: '⏰ Payment Reminder',
            body: `Your consultation fee of ₹${query.fee} is pending. Complete payment to get your answer!`
          },
          data: {
            type: 'payment_reminder',
            queryId: doc.id
          },
          token: fcmToken
        }
        
        try {
          await admin.messaging().send(message)
          console.log('Payment reminder sent to user:', userId)
        } catch (error) {
          console.error('Error sending reminder:', error)
        }
      }
    }
    
    return null
  })

// Helper function to notify admin
async function notifyAdmin(type: string, data: { title: string; body: string; queryId: string }) {
  const adminUID = functions.config().admin?.uid || process.env.VITE_ADMIN_UID
  
  if (!adminUID) {
    console.error('Admin UID not configured')
    return
  }
  
  // Get admin's FCM token
  const adminDoc = await admin.firestore().doc(`users/${adminUID}`).get()
  const fcmToken = adminDoc.data()?.fcmToken
  
  if (fcmToken) {
    const message = {
      notification: {
        title: data.title,
        body: data.body
      },
      data: {
        type,
        queryId: data.queryId
      },
      token: fcmToken
    }
    
    try {
      await admin.messaging().send(message)
      console.log('Admin notification sent:', type)
    } catch (error) {
      console.error('Error sending admin notification:', error)
    }
  }
}
