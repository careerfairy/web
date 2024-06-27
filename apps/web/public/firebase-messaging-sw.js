/* eslint-disable */
importScripts(
   "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"
)
importScripts(
   "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js"
)

// Your web app's Firebase configuration
const firebaseConfig = {
   apiKey: "AIzaSyAMx1wVVxqo4fooh0OMVSeSTOqNKzMbch0",
   authDomain: "careerfairy-e1fd9.firebaseapp.com",
   databaseURL: "https://careerfairy-e1fd9.firebaseio.com",
   projectId: "careerfairy-e1fd9",
   storageBucket: "careerfairy-e1fd9.appspot.com",
   messagingSenderId: "993933306494",
   appId: "1:993933306494:web:8c51e7a31d29ea9143862f",
}

firebase.initializeApp(firebaseConfig)

class CustomPushEvent extends Event {
   constructor(data) {
      super("push")

      Object.assign(this, data)
      this.custom = true
   }
}

/*
 * Overrides push notification data, to avoid having 'notification' key and firebase blocking
 * the message handler from being called
 */
self.addEventListener("push", (e) => {
   // Skip if event is our own custom event
   if (e.custom) return

   // Kep old event data to override
   const oldData = e.data

   // Create a new event to dispatch, pull values from notification key and put it in data key,
   // and then remove notification key
   const newEvent = new CustomPushEvent({
      data: {
         ehheh: oldData.json(),
         json() {
            const newData = oldData.json()
            newData.data = {
               ...newData.data,
               ...newData.notification,
            }
            delete newData.notification
            return newData
         },
      },
      waitUntil: e.waitUntil.bind(e),
   })

   // Stop event propagation
   e.stopImmediatePropagation()

   // Dispatch the new wrapped event
   dispatchEvent(newEvent)
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
   // console.log('[firebase-messaging-sw.js] Received background message ', payload);

   const { title, body, image, icon, ...restPayload } = payload.data
   const notificationOptions = {
      body,
      icon: image || "/icons/firebase-logo.png", // path to your "fallback" firebase notification logo
      data: restPayload,
   }
   return self.registration.showNotification(title, notificationOptions)
})

self.addEventListener("notificationclick", (event) => {
   if (event?.notification?.data && event?.notification?.data?.link) {
      self.clients.openWindow(event.notification.data.link)
   }

   // close notification after click
   event.notification.close()
})
