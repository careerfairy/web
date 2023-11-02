import { initializeApp } from "firebase/app"
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore"
import { isLocalEnvironment } from "../util"

/**
 * Ideally we wouldn't need the client SDK on the server..
 * But, to consume the data bundles, we need to use it
 */

// Production settings
const firebaseConfig = {
   apiKey: "AIzaSyAMx1wVVxqo4fooh0OMVSeSTOqNKzMbch0",
   authDomain: "careerfairy-e1fd9.firebaseapp.com",
   databaseURL: "https://careerfairy-e1fd9.firebaseio.com",
   projectId: "careerfairy-e1fd9",
   storageBucket: "careerfairy-e1fd9.appspot.com",
   messagingSenderId: "993933306494",
   appId: "1:993933306494:web:8c51e7a31d29ea9143862f",
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
