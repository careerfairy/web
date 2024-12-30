import { fromDateFirestoreFn } from "@careerfairy/shared-lib/dist/firebaseTypes"
import firebase from "firebase/compat/app"
import "firebase/compat/auth"
import "firebase/compat/firestore"
import "firebase/compat/functions"
import "firebase/compat/storage"
import { shouldUseEmulators } from "../../util/CommonUtil"
import SessionStorageUtil from "../../util/SessionStorageUtil"

export const firebaseConfig = {
   apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
   authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
   databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
   projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
   storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
   messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
}

export const region = "europe-west1"

/**
 * Create a custom firebase instance
 *
 * @param name Instance name
 * @param firestoreSettings
 */
export const createFirebaseInstance = (
   name: string,
   firestoreSettings?: firebase.firestore.Settings
): firebase.app.App => {
   const existingApp = firebase.apps.find((app) => app.name === name)
   if (existingApp) {
      return existingApp
   }

   const app = firebase.initializeApp(firebaseConfig, name)

   // Set Firestore settings AFTER enabling persistence
   app.firestore().settings(getFirestoreSettings(firestoreSettings))

   if (shouldUseEmulators()) {
      app.auth().useEmulator("http://127.0.0.1:9099")
      app.firestore().useEmulator("127.0.0.1", 8080)
      app.functions(region).useEmulator("127.0.0.1", 5001)
      app.storage().useEmulator("127.0.0.1", 9199)
      console.log("You're connected to the emulators!")
   }

   return app
}

const getFirestoreSettings = (
   firestoreSettings?: firebase.firestore.Settings
) => {
   const firestoreDefaultSettings = {
      merge: true,
      cacheSizeBytes: 100 * 1024 * 1024, // 100MB
   }

   // The user doesn't seem to have Firestore connectivity, let's enable the long polling mode
   // This mode is set on FirebaseUtils.js
   if (typeof window !== "undefined") {
      if (SessionStorageUtil.getIsLongPollingMode()) {
         firestoreDefaultSettings["experimentalForceLongPolling"] = true
         console.warn(
            "Firestore settings with experimentalForceLongPolling=true"
         )
      }
   }

   return Object.assign(firestoreDefaultSettings, firestoreSettings)
}

// Default instance that we can re-use, default settings for firestore, auth, etc
// [DEFAULT] app name is required for redux-firestore 🤦
const firebaseApp: firebase.app.App = createFirebaseInstance("[DEFAULT]")
export const firestore = firebase.firestore()
export const auth = firebase.auth()
export const FirestoreInstance = firebaseApp.firestore()
export const AuthInstance = firebaseApp.auth()
export const FunctionsInstance = firebaseApp.functions(region)

if (typeof window !== "undefined") {
   // Enable offline persistence BEFORE setting any other Firestore settings
   firestore
      .enablePersistence({ synchronizeTabs: true })
      .catch((err) => {
         if (err.code === "failed-precondition") {
            // Multiple tabs open, persistence can only be enabled in one tab at a time
            console.warn("Firebase persistence failed: Multiple tabs open", err)
         } else if (err.code === "unimplemented") {
            // The current browser doesn't support persistence
            console.warn(
               "Firebase persistence not supported in this browser",
               err
            )
         }
      })
      .then(() => {
         console.log("Firebase persistence enabled")
      })
}

export const FieldValue = firebase.firestore.FieldValue
export const Timestamp = firebase.firestore.Timestamp
export const fromDate: fromDateFirestoreFn = Timestamp?.fromDate

export default firebaseApp
