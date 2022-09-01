import { firestore } from "./lib/firebase"
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
   FirebaseGroupRepository,
   IGroupRepository,
} from "@careerfairy/shared-lib/dist/groups/GroupRepository"

const firestoreInstance = firestore as any

/**
 * Singleton instances of the repositories
 */

export const userRepo: IUserScriptsRepository = new UserScriptsRepository(
   firestoreInstance,
   FieldValue,
   Timestamp
)

export const groupRepo: IGroupRepository = new FirebaseGroupRepository(
   firestoreInstance,
   FieldValue
)

export const livestreamRepo: ILivestreamScriptsRepository =
   new LivestreamScriptsRepository(firestoreInstance, FieldValue)
