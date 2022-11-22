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
   bigQueryClient,
   BigQueryRepository,
   IBigQueryRepository,
} from "./bigQuery"
import {
   FirebaseMarketingUsersRepository,
   IMarketingUsersRepository,
} from "@careerfairy/shared-lib/dist/marketing/MarketingRepo"
import {
   ILivestreamFunctionsRepository,
   LivestreamFunctionsRepository,
} from "../lib/LivestreamFunctionsRepository"

import {
   GroupFunctionsRepository,
   IGroupFunctionsRepository,
} from "../lib/GroupFunctionsRepository"
import {
   IRecommendationRepository,
   RecommendationRepository,
} from "../lib/RecommendationRepository"

const firestoreInstance = admin.firestore() as any
const authInstance = admin.auth()

export const groupRepo: IGroupFunctionsRepository =
   new GroupFunctionsRepository(
      firestoreInstance,
      admin.firestore.FieldValue,
      authInstance
   )

export const userRepo: IUserRepository = new FirebaseUserRepository(
   firestoreInstance,
   admin.firestore.FieldValue,
   admin.firestore.Timestamp
)

export const fieldOfStudyRepo: IFieldOfStudyRepository =
   new FirebaseFieldOfStudyRepository(firestoreInstance)

export const livestreamsRepo: ILivestreamFunctionsRepository =
   new LivestreamFunctionsRepository(
      firestoreInstance,
      admin.firestore.FieldValue
   )

export const atsRepo = (
   apiKey: string,
   accountToken: string
): IATSRepository => {
   return new MergeATSRepository(apiKey, accountToken, admin.firestore as any)
}

export const marketingUsersRepo: IMarketingUsersRepository =
   new FirebaseMarketingUsersRepository(
      firestoreInstance,
      admin.firestore.FieldValue
   )

export const bigQueryRepo: IBigQueryRepository = new BigQueryRepository(
   bigQueryClient
)

export const recommendationRepo: IRecommendationRepository =
   new RecommendationRepository(admin.firestore)
