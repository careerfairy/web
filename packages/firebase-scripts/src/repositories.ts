import {
   FirebaseFieldOfStudyRepository,
   IFieldOfStudyRepository,
} from "@careerfairy/shared-lib/dist/fieldOfStudy/FieldOfStudyRepository"
import { FieldValue, Timestamp } from "firebase-admin/firestore"
import {
   FirebaseUniversityRepository,
   IUniversityRepository,
} from "../../shared-lib/dist/universities/UniversityRepository"
import {
   CustomJobScriptsRepository,
   ICustomJobScriptsRepository,
} from "./api/CustomJobsScriptRepository"
import {
   GroupScriptsRepository,
   IGroupScriptsRepository,
} from "./api/GroupScriptsRepository"
import {
   ILivestreamScriptsRepository,
   LivestreamScriptsRepository,
} from "./api/LivestreamScriptsRepository"
import {
   IUserScriptsRepository,
   UserScriptsRepository,
} from "./api/UserScriptsRepository"
import { auth, firestore } from "./lib/firebase"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export const fieldOfStudyRepo: IFieldOfStudyRepository =
   new FirebaseFieldOfStudyRepository(firestoreInstance)

export const customJobRepo: ICustomJobScriptsRepository =
   new CustomJobScriptsRepository(firestore as any, FieldValue)
