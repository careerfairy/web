import { initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getStorage, Storage } from "firebase-admin/storage"
import {
   FieldValue,
   getFirestore,
   Timestamp,
   Firestore,
   FieldPath,
} from "firebase-admin/firestore"

/**
 * Firebase Admin SDK
 *
 * When running on Cloud Functions, the credentials are automatically
 * provided by the Google Cloud runtime.
 *
 * When running locally with the emulators environment variables, it will
 * connect to the emulators.
 */
initializeApp()

export const firestore = getFirestore()
export const auth = getAuth()
export const storage = getStorage()

export { FieldValue, Timestamp, Storage, Firestore, FieldPath }
