import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { 
  requestNotificationPermission, 
  saveFCMToken, 
  onForegroundMessage 
} from '@/lib/notifications'
import toast from 'react-hot-toast'

export function useNotifications() {
  const { user } = useAuth()
  const [fcmToken, setFcmToken] = useState<string | null>(null)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if (!user) return

    // Check current permission
    setNotificationPermission(Notification.permission)

    // Listen for foreground messages
    onForegroundMessage((payload) => {
      console.log('Notification received:', payload)
      
      // Show toast notification
      if (payload.notification) {
        toast.success(payload.notification.body || 'New notification', {
          duration: 5000,
          icon: '🔔'
        })
      }
    })
  }, [user])

  const enableNotifications = async () => {
    if (!user) {
      toast.error('Please login first')
      return false
    }

    try {
      const token = await requestNotificationPermission()
      
      if (token) {
        setFcmToken(token)
        setNotificationPermission('granted')
        
        // Save token to user profile
        await saveFCMToken(user.uid, token)
        
        toast.success('Notifications enabled! You\'ll receive updates about your queries.')
        return true
      } else {
        toast.error('Notification permission denied')
        return false
      }
    } catch (error) {
      console.error('Error enabling notifications:', error)
      toast.error('Failed to enable notifications')
      return false
    }
  }

  return {
    fcmToken,
    notificationPermission,
    enableNotifications,
    isEnabled: notificationPermission === 'granted'
  }
}
