import { FieldValue, Timestamp } from "firebase-admin/firestore"
import {
   FirebaseUniversityRepository,
   IUniversityRepository,
} from "../../shared-lib/dist/universities/UniversityRepository"
import {
   CustomJobScriptsRepository,
   ICustomJobScriptsRepository,
} from "../dist/api/CustomJobsScriptRepository"
import {
   GroupScriptsRepository,
   IGroupScriptsRepository,
} from "../dist/api/GroupScriptsRepository"
import {
   ILivestreamScriptsRepository,
   LivestreamScriptsRepository,
} from "../dist/api/LivestreamScriptsRepository"
import {
   IUserScriptsRepository,
   UserScriptsRepository,
} from "./api/UserScriptsRepository"
import { auth, firestore } from "./lib/firebase"

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

export const universitiesRepo: IUniversityRepository =
   new FirebaseUniversityRepository(firestoreInstance)

export const customJobRepo: ICustomJobScriptsRepository =
   new CustomJobScriptsRepository(firestore as any, FieldValue)
