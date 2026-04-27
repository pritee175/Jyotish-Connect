import { getMessagingInstance } from './firebase'
import { getToken, onMessage } from 'firebase/messaging'

// Request notification permission and get FCM token
export async function requestNotificationPermission(): Promise<string | null> {
  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.log('Notification permission denied')
      return null
    }

    const messaging = await getMessagingInstance()
    if (!messaging) {
      console.log('Messaging not supported')
      return null
    }

    // Get FCM token
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY
    if (!vapidKey) {
      console.warn('VAPID key not configured')
      return null
    }

    const token = await getToken(messaging, { vapidKey })
    console.log('FCM Token:', token)
    return token
  } catch (error) {
    console.error('Error getting notification permission:', error)
    return null
  }
}

// Listen for foreground messages
export function onForegroundMessage(callback: (payload: any) => void) {
  getMessagingInstance().then(messaging => {
    if (!messaging) return
    
    onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload)
      callback(payload)
      
      // Show browser notification
      if (payload.notification) {
        new Notification(payload.notification.title || 'JyotishConnect', {
          body: payload.notification.body,
          icon: '/om.svg',
          badge: '/om.svg',
          tag: 'jyotish-notification',
          requireInteraction: true
        })
      }
    })
  })
}

// Save FCM token to user profile
export async function saveFCMToken(userId: string, token: string) {
  try {
    const { doc, updateDoc } = await import('firebase/firestore')
    const { db } = await import('./firebase')
    
    await updateDoc(doc(db, 'users', userId), {
      fcmToken: token,
      fcmTokenUpdatedAt: new Date().toISOString()
    })
    
    console.log('FCM token saved to user profile')
  } catch (error) {
    console.error('Error saving FCM token:', error)
  }
}

// Notification types
export type NotificationType = 
  | 'fee_set'
  | 'payment_received'
  | 'answer_ready'
  | 'clarification_needed'
  | 'new_query'
  | 'payment_reminder'

// Send notification (this will be called from Cloud Functions)
export interface NotificationPayload {
  userId: string
  type: NotificationType
  title: string
  body: string
  data?: Record<string, string>
}
