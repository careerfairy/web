import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getFunctions } from "firebase/functions"
import "firebase/messaging" // Import only if using Firebase web version for notifications

import {
   FIREBASE_API_KEY,
   FIREBASE_APPS_ID,
   FIREBASE_AUTH_DOMAIN,
   FIREBASE_DATABASE_URL,
   FIREBASE_MESSAGING_SENDER_ID,
   FIREBASE_PROJECT_ID,
   FIREBASE_STORAGE_BUCKET,
} from "@env"

const firebaseConfig = {
   apiKey: FIREBASE_API_KEY,
   authDomain: FIREBASE_AUTH_DOMAIN,
   databaseURL: FIREBASE_DATABASE_URL,
   projectId: FIREBASE_PROJECT_ID,
   storageBucket: FIREBASE_STORAGE_BUCKET,
   messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
   appId: FIREBASE_APPS_ID,
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const functions = getFunctions()

// Export the Firestore instance
export { app, auth, db, functions }
