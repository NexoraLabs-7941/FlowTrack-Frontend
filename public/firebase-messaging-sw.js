// Import Firebase compat libraries inside the service worker
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js');

// Initialize Firebase app in the Service Worker
firebase.initializeApp({
  apiKey: "AIzaSyAXvxStbzvI65fMwuTFsX4wk87n6PIwcqk",
  authDomain: "flowtracknotis.firebaseapp.com",
  projectId: "flowtracknotis",
  storageBucket: "flowtracknotis.firebasestorage.app",
  messagingSenderId: "747649396736",
  appId: "1:747649396736:web:39d2b014c666f40adf28e5"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  // Customize notification display
  const notificationTitle = payload.notification ? payload.notification.title : 'FlowTrack Alert';
  const notificationOptions = {
    body: payload.notification ? payload.notification.body : 'New notification received.',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
