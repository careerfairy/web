import { auth, firestore } from "./lib/firebase"
import { FieldValue, Timestamp } from "firebase-admin/firestore"
import {
   ILivestreamScriptsRepository,
   LivestreamScriptsRepository,
} from "./api/LivestreamScriptsRepository"
import {
   IUserScriptsRepository,
   UserScriptsRepository,
} from "./api/UserScriptsRepository"
import {
   GroupScriptsRepository,
   IGroupScriptsRepository,
} from "./api/GroupScriptsRepository"

const firestoreInstance = firestore as any
const authInstance = auth

/**
 * Singleton instances of the repositories
 */

export const userRepo: IUserScriptsRepository = new UserScriptsRepository(
   firestoreInstance,
   FieldValue,
   Timestamp
)

export const groupRepo: IGroupScriptsRepository = new GroupScriptsRepository(
   firestoreInstance,
   FieldValue,
   authInstance
)

export const livestreamRepo: ILivestreamScriptsRepository =
   new LivestreamScriptsRepository(firestoreInstance, FieldValue)
