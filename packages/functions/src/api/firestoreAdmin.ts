import { initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { FieldValue, getFirestore, Timestamp } from "firebase-admin/firestore"

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

export { FieldValue, Timestamp }
