import { admin } from "./firestoreAdmin"
import {
   FirebaseUserRepository,
   IUserRepository,
} from "@careerfairy/shared-lib/users/UserRepository"
import {
   FirebaseFieldOfStudyRepository,
   IFieldOfStudyRepository,
} from "@careerfairy/shared-lib/fieldOfStudy/FieldOfStudyRepository"
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

const firestoreInstance = admin.firestore() as any

export const groupRepo: IGroupFunctionsRepository =
   new GroupFunctionsRepository(firestoreInstance, admin.firestore.FieldValue)

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
