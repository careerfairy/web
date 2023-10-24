import axios from "axios"
import { projectId } from "./lib/firebase"

/**
 * Delete all collections from Firestore emulator
 */
export function clearFirestoreData() {
   return axios.delete(
      `http://127.0.0.1:8080/emulator/v1/projects/${projectId}/databases/(default)/documents`
   )
}

/**
 * Delete all accounts from Auth Emulator
 */
export function clearAuthData() {
   return axios.delete(
      `http://127.0.0.1:9099/emulator/v1/projects/${projectId}/accounts`
   )
}
