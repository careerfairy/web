import { App, initializeApp } from "firebase-admin/app"
import { Auth, getAuth } from "firebase-admin/auth"
import { Firestore, getFirestore, FieldValue } from "firebase-admin/firestore"

export const projectId = "careerfairy-e1fd9"

/**
 * We only want to target the local firebase emulators
 *
 * Force the existence of the env variables even if they don't exist
 */
process.env["FIREBASE_AUTH_EMULATOR_HOST"] = "localhost:9099"
process.env["FIREBASE_STORAGE_EMULATOR_HOST"] = "localhost:9199"
process.env["FIRESTORE_EMULATOR_HOST"] = "localhost:8080"

const app: App = initializeApp({ projectId })

export const auth: Auth = getAuth(app)
export const firestore: Firestore = getFirestore(app)
export const fieldValue = FieldValue
