import {
   FirebaseHighlightRepository,
   IHighlightRepository,
} from "@careerfairy/shared-lib/highlights/HighlightRepository"
import {
   FirebaseWishRepository,
   IWishRepository,
} from "@careerfairy/shared-lib/wishes/WishRepository"
import {
   IUserRepository,
   FirebaseUserRepository,
} from "@careerfairy/shared-lib/users/UserRepository"
import firebaseApp, { FieldValue, Timestamp } from "./firebase/FirebaseInstance"
import {
   IGroupRepository,
   FirebaseGroupRepository,
} from "@careerfairy/shared-lib/groups/GroupRepository"
import {
   ILivestreamRepository,
   FirebaseLivestreamRepository,
} from "@careerfairy/shared-lib/livestreams/LivestreamRepository"

import {
   FirebaseFieldOfStudyRepository,
   IFieldOfStudyRepository,
} from "@careerfairy/shared-lib/fieldOfStudy/FieldOfStudyRepository"

import {
   FirebaseUniversityRepository,
   IUniversityRepository,
} from "@careerfairy/shared-lib/universities/UniversityRepository"
import {
   FirebaseRewardRepository,
   IRewardRepository,
} from "@careerfairy/shared-lib/rewards/RewardRepository"
import {
   ISparkRepository,
   SparkRepository,
} from "@careerfairy/shared-lib/sparks/SparkRepository"

const firestoreInstance = firebaseApp.firestore()

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
   FieldValue,
   Timestamp
)

export const groupRepo: IGroupRepository = new FirebaseGroupRepository(
   firestoreInstance,
   FieldValue
)

export const livestreamRepo: ILivestreamRepository =
   new FirebaseLivestreamRepository(firestoreInstance, FieldValue)

export const fieldOfStudyRepo: IFieldOfStudyRepository =
   new FirebaseFieldOfStudyRepository(firestoreInstance)

export const universityRepo: IUniversityRepository =
   new FirebaseUniversityRepository(firestoreInstance)

export const rewardsRepo: IRewardRepository = new FirebaseRewardRepository(
   firestoreInstance,
   FieldValue,
   Timestamp
)

export const sparkRepo: ISparkRepository = new SparkRepository(
   firestoreInstance,
   FieldValue,
   Timestamp
)
