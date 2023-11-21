import {
   FirebaseFieldOfStudyRepository,
   IFieldOfStudyRepository,
} from "@careerfairy/shared-lib/fieldOfStudy/FieldOfStudyRepository"
import {
   FirebaseMarketingUsersRepository,
   IMarketingUsersRepository,
} from "@careerfairy/shared-lib/marketing/MarketingRepo"
import {
   FirebaseRewardRepository,
   IRewardRepository,
} from "@careerfairy/shared-lib/rewards/RewardRepository"
import {
   ILivestreamFunctionsRepository,
   LivestreamFunctionsRepository,
} from "../lib/LivestreamFunctionsRepository"
import { BigQueryRepository, IBigQueryRepository } from "./bigQuery"

import { getATSRepository } from "../lib/merge/util"
import {
   GroupFunctionsRepository,
   IGroupFunctionsRepository,
} from "../lib/GroupFunctionsRepository"
import { IATSRepository } from "../lib/IATSRepository"
import {
   IUserFunctionsRepository,
   UserFunctionsRepository,
} from "../lib/UserFunctionsRepository"
import {
   ISparkFunctionsRepository,
   SparkFunctionsRepository,
} from "../lib/sparks/SparkFunctionsRepository"

import { SparksFeedReplenisher } from "../lib/sparks/sparksFeedReplenisher"
import { FieldValue, firestore, Timestamp, storage } from "./firestoreAdmin"

import logger = require("firebase-functions/logger")
import bigQueryClient from "./bigQueryClient"
import {
   sparkEventsHandler,
   sparkSecondsWatchedHanlder,
} from "../lib/bigQuery/sparks/SparksBigQueryServices"
import { IPublicSparksNotificationsRepository } from "@careerfairy/shared-lib/sparks/public-notifications/IPublicSparksNotificationsRepository"
import PublicSparksNotificationsRepository from "@careerfairy/shared-lib/sparks/public-notifications/PublicSparksNotificationsRepository"
import SparksAnalyticsRepository from "../lib/sparks/analytics/SparksAnalyticsRepository"

export const groupRepo: IGroupFunctionsRepository =
   new GroupFunctionsRepository(firestore as any, FieldValue)

export const userRepo: IUserFunctionsRepository = new UserFunctionsRepository(
   firestore as any,
   FieldValue,
   Timestamp
)

export const rewardsRepo: IRewardRepository = new FirebaseRewardRepository(
   firestore as any,
   FieldValue,
   Timestamp
)

export const fieldOfStudyRepo: IFieldOfStudyRepository =
   new FirebaseFieldOfStudyRepository(firestore as any)

export const livestreamsRepo: ILivestreamFunctionsRepository =
   new LivestreamFunctionsRepository(firestore as any, FieldValue)

export const atsRepo = (
   apiKey: string,
   accountToken: string
): IATSRepository => {
   return getATSRepository(apiKey, accountToken, firestore as any)
}

export const marketingUsersRepo: IMarketingUsersRepository =
   new FirebaseMarketingUsersRepository(firestore as any, FieldValue)

export const bigQueryRepo: IBigQueryRepository = new BigQueryRepository(
   bigQueryClient
)

const feedReplenisher = new SparksFeedReplenisher(firestore as any)

export const sparkRepo: ISparkFunctionsRepository =
   new SparkFunctionsRepository(
      firestore,
      storage,
      logger,
      feedReplenisher,
      sparkEventsHandler,
      sparkSecondsWatchedHanlder
   )

export const publicSparksNotificationsRepo: IPublicSparksNotificationsRepository =
   new PublicSparksNotificationsRepository(firestore as any)

export const getSparksAnalyticsRepoInstance = (
   groupId: string
): SparksAnalyticsRepository => {
   return new SparksAnalyticsRepository(groupId, bigQueryClient)
}
