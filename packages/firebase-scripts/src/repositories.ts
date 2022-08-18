import { firestore } from "./lib/firebase"
import { FieldValue } from "firebase-admin/firestore"
import {
   ILivestreamScriptsRepository,
   LivestreamScriptsRepository,
} from "./api/LivestreamScriptsRepository"
import {
   GroupScriptsRepository,
   IGroupScriptsRepository,
} from "./api/GroupScriptsRepository"
import {
   IUserScriptsRepository,
   UserScriptsRepository,
} from "./api/UserScriptsRepository"

const firestoreInstance = firestore as any

/**
 * Singleton instances of the repositories
 */

export const userScriptsRepo: IUserScriptsRepository =
   new UserScriptsRepository(firestoreInstance, FieldValue)

export const groupScriptsRepo: IGroupScriptsRepository =
   new GroupScriptsRepository(firestoreInstance, FieldValue)

export const livestreamScriptsRepo: ILivestreamScriptsRepository =
   new LivestreamScriptsRepository(firestoreInstance, FieldValue)
