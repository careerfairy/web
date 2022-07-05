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
import firebaseApp from "./firebase/FirebaseInstance"
import {
   IGroupRepository,
   FirebaseGroupRepository,
} from "@careerfairy/shared-lib/dist/groups/GroupRepository"
import {
   ILivestreamRepository,
   FirebaseLivestreamRepository,
} from "@careerfairy/shared-lib/dist/livestreams/LivestreamRepository"

const firestoreInstance = firebaseApp.firestore()

/**
 * Singleton instances of the repositories
 */
export const highlightRepo: IHighlightRepository =
   new FirebaseHighlightRepository(firestoreInstance)

export const wishlistRepo: IWishRepository = new FirebaseWishRepository(
   firestoreInstance
)

export const userRepo: IUserRepository = new FirebaseUserRepository(
   firestoreInstance
)

export const groupRepo: IGroupRepository = new FirebaseGroupRepository(
   firestoreInstance
)

export const livestreamRepo: ILivestreamRepository =
   new FirebaseLivestreamRepository(firestoreInstance)
