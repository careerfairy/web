import { admin } from "./firestoreAdmin"
import {
   FirebaseFieldOfStudyRepository,
   IFieldOfStudyRepository,
} from "@careerfairy/shared-lib/fieldOfStudy/FieldOfStudyRepository"
import {
   FirebaseRewardRepository,
   IRewardRepository,
} from "@careerfairy/shared-lib/rewards/RewardRepository"
import {
   bigQueryClient,
   BigQueryRepository,
   IBigQueryRepository,
} from "./bigQuery"
import {
   FirebaseMarketingUsersRepository,
   IMarketingUsersRepository,
} from "@careerfairy/shared-lib/marketing/MarketingRepo"
import {
   ILivestreamFunctionsRepository,
   LivestreamFunctionsRepository,
} from "../lib/LivestreamFunctionsRepository"

import {
   GroupFunctionsRepository,
   IGroupFunctionsRepository,
} from "../lib/GroupFunctionsRepository"
import { IATSRepository } from "../lib/IATSRepository"
import { MergeATSRepository } from "../lib/merge/MergeATSRepository"
import {
   IUserFunctionsRepository,
   UserFunctionsRepository,
} from "../lib/UserFunctionsRepository"

const firestoreInstance = admin.firestore() as any

export const groupRepo: IGroupFunctionsRepository =
   new GroupFunctionsRepository(firestoreInstance, admin.firestore.FieldValue)

export const userRepo: IUserFunctionsRepository = new UserFunctionsRepository(
   firestoreInstance,
   admin.firestore.FieldValue,
   admin.firestore.Timestamp
)

export const rewardsRepo: IRewardRepository = new FirebaseRewardRepository(
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
