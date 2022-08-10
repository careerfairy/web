import {
   FirebaseGroupRepository,
   IGroupRepository,
} from "@careerfairy/shared-lib/dist/groups/GroupRepository"
import { admin } from "./firestoreAdmin"
import { MergeATSRepository } from "@careerfairy/shared-lib/dist/ats/MergeATSRepository"
import { IATSRepository } from "@careerfairy/shared-lib/src/ats/IATSRepository"
import {
   FirebaseUserRepository,
   IUserRepository,
} from "@careerfairy/shared-lib/dist/users/UserRepository"
import {
   FirebaseFieldOfStudyRepository,
   IFieldOfStudyRepository,
} from "@careerfairy/shared-lib/dist/fieldOfStudy/FieldOfStudyRepository"
import {
   FirebaseLevelOfStudyRepository,
   ILevelOfStudyRepository,
} from "@careerfairy/shared-lib/dist/levelOfStudy/LevelOfStudyRepository"
import {
   FirebaseLivestreamRepository,
   ILivestreamRepository,
} from "@careerfairy/shared-lib/dist/livestreams/LivestreamRepository"

const firestoreInstance = admin.firestore() as any

export const groupRepo: IGroupRepository = new FirebaseGroupRepository(
   firestoreInstance,
   admin.firestore.FieldValue
)

export const userRepo: IUserRepository = new FirebaseUserRepository(
   firestoreInstance,
   admin.firestore.FieldValue
)

export const fieldOfStudyRepo: IFieldOfStudyRepository =
   new FirebaseFieldOfStudyRepository(firestoreInstance)

export const levelOfStudyRepo: ILevelOfStudyRepository =
   new FirebaseLevelOfStudyRepository(firestoreInstance)

export const livestreamRepo: ILivestreamRepository =
   new FirebaseLivestreamRepository(
      firestoreInstance,
      admin.firestore.FieldValue
   )

export const atsRepo = (
   apiKey: string,
   accountToken: string
): IATSRepository => {
   return new MergeATSRepository(apiKey, accountToken)
}
