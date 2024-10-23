import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { firebaseConfig } from "./constants/constants"
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Export the Firestore instance
export { db, app }
