// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js')

// Initialize Firebase in service worker
firebase.initializeApp({
  apiKey: "AIzaSyCGz-jIlgoSoSmmenXxBPtAWO69obpweRQ",
  authDomain: "jyotish-connect.firebaseapp.com",
  projectId: "jyotish-connect",
  storageBucket: "jyotish-connect.firebasestorage.app",
  messagingSenderId: "826989991466",
  appId: "1:826989991466:web:d70517d07450a7a9725553"
})

const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload)
  
  const notificationTitle = payload.notification?.title || 'JyotishConnect'
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/om.svg',
    badge: '/om.svg',
    tag: 'jyotish-notification',
    data: payload.data,
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  }

  return self.registration.showNotification(notificationTitle, notificationOptions)
})

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  
  event.notification.close()
  
  if (event.action === 'view' || !event.action) {
    const queryId = event.notification.data?.queryId
    const url = queryId 
      ? `/app/query/${queryId}` 
      : '/app/queries'
    
    event.waitUntil(
      clients.openWindow(url)
    )
  }
})
