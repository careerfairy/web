import {
   FirebaseHighlightRepository,
   IHighlightRepository,
} from "@careerfairy/shared-lib/dist/highlights/HighlightRepository"
import {
   FirebaseWishRepository,
   IWishRepository,
} from "@careerfairy/shared-lib/dist/wishes/WishRepository"
import {
   IUserRepository,
   FirebaseUserRepository,
} from "@careerfairy/shared-lib/dist/users/UserRepository"
import {
   IGroupRepository,
   FirebaseGroupRepository,
} from "@careerfairy/shared-lib/dist/groups/GroupRepository"
import {
   ILivestreamRepository,
   FirebaseLivestreamRepository,
} from "@careerfairy/shared-lib/dist/livestreams/LivestreamRepository"
import { firestore } from "./lib/firebase"
import { FieldValue } from "firebase-admin/firestore"
import {
   FirebaseFieldOfStudyRepository,
   IFieldOfStudyRepository,
} from "@careerfairy/shared-lib/dist/fieldOfStudy/FieldOfStudyRepository"

const firestoreInstance = firestore as any

/**
 * Singleton instances of the repositories
 */
export const highlightRepo: IHighlightRepository =
   new FirebaseHighlightRepository(firestoreInstance)

export const wishlistRepo: IWishRepository = new FirebaseWishRepository(
   firestoreInstance,
   FieldValue
)

export const userRepo: IUserRepository = new FirebaseUserRepository(
   firestoreInstance,
   FieldValue
)

export const groupRepo: IGroupRepository = new FirebaseGroupRepository(
   firestoreInstance,
   FieldValue
)

export const livestreamRepo: ILivestreamRepository =
   new FirebaseLivestreamRepository(firestoreInstance, FieldValue)

export const fieldOfStudyRepo: IFieldOfStudyRepository =
   new FirebaseFieldOfStudyRepository(firestoreInstance)
