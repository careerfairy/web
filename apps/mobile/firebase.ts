import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import "firebase/messaging" // Import only if using Firebase web version for notifications

import {
   API_KEY,
   APPS_ID,
   AUTH_DOMAIN,
   DATABASE_URL,
   FB_PROJECT_ID,
   MESSAGING_SENDER_ID,
   STORAGE_BUCKET,
} from "@env"

const firebaseConfig = {
   apiKey: API_KEY,
   authDomain: AUTH_DOMAIN,
   databaseURL: DATABASE_URL,
   projectId: FB_PROJECT_ID,
   storageBucket: STORAGE_BUCKET,
   messagingSenderId: MESSAGING_SENDER_ID,
   appId: APPS_ID,
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

// Export the Firestore instance
export { db, app, auth }
