import { initializeApp } from "firebase/app"
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore"
import { isLocalEnvironment } from "../util"

/**
 * Ideally we wouldn't need the client SDK on the server..
 * But, to consume the data bundles, we need to use it
 */

// Production settings
const firebaseConfig = {
   apiKey: process.env.NEXT_PUBLIC_PROD_FIREBASE_API_KEY,
   authDomain: process.env.NEXT_PUBLIC_PROD_FIREBASE_AUTH_DOMAIN,
   databaseURL: process.env.NEXT_PUBLIC_PROD_FIREBASE_DATABASE_URL,
   projectId: process.env.NEXT_PUBLIC_PROD_FIREBASE_PROJECT_ID,
   storageBucket: process.env.NEXT_PUBLIC_PROD_FIREBASE_STORAGE_BUCKET,
   messagingSenderId: process.env.NEXT_PUBLIC_PROD_FIREBASE_MESSAGING_SENDER_ID,
   appId: process.env.NEXT_PUBLIC_PROD_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Cloud Firestore and get a reference to the service
export const firestoreClientSDK = getFirestore(app)

// Connect to emulators
if (isLocalEnvironment()) {
   connectFirestoreEmulator(firestoreClientSDK, "127.0.0.1", 8080)
   console.log("Using Firestore Client connected to Emulators")
} else {
   console.log("Using Firestore Client connected to Production")
}
