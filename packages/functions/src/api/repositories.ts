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
   FirebaseUniversityRepository,
   IUniversityRepository,
} from "@careerfairy/shared-lib/universities/UniversityRepository"
import {
   ILivestreamFunctionsRepository,
   LivestreamFunctionsRepository,
} from "../lib/LivestreamFunctionsRepository"
import { BigQueryRepository, IBigQueryRepository } from "./bigQuery"

import {
   EmailNotificationFunctionsRepository,
   IEmailNotificationRepository,
} from "@careerfairy/shared-lib/notifications/IEmailNotificationRepository"
import {
   GroupFunctionsRepository,
   IGroupFunctionsRepository,
} from "../lib/GroupFunctionsRepository"
import { IATSRepository } from "../lib/IATSRepository"
import {
   IUserFunctionsRepository,
   UserFunctionsRepository,
} from "../lib/UserFunctionsRepository"
import { getATSRepository } from "../lib/merge/util"
import {
   ISparkFunctionsRepository,
   SparkFunctionsRepository,
} from "../lib/sparks/SparkFunctionsRepository"

import { IPublicSparksNotificationsRepository } from "@careerfairy/shared-lib/sparks/public-notifications/IPublicSparksNotificationsRepository"
import PublicSparksNotificationsRepository from "@careerfairy/shared-lib/sparks/public-notifications/PublicSparksNotificationsRepository"
import {
   CustomJobFunctionsRepository,
   ICustomJobFunctionsRepository,
} from "../lib/CustomJobFunctionsRepository"
import { groupEventsHandler } from "../lib/bigQuery/group/GroupBigQueryServices"
import {
   sparkEventsHandler,
   sparkSecondsWatchedHanlder,
} from "../lib/bigQuery/sparks/SparksBigQueryServices"
import { apiClient } from "../lib/customerio/client"
import {
   INotificationService,
   NotificationService,
} from "../lib/notifications/NotificationService"
import GroupSparksAnalyticsRepository from "../lib/sparks/analytics/GroupSparksAnalyticsRepository"
import { SparksFeedReplenisher } from "../lib/sparks/sparksFeedReplenisher"
import bigQueryClient from "./bigQueryClient"
import { FieldValue, Timestamp, firestore, storage } from "./firestoreAdmin"

import logger = require("firebase-functions/logger")

export const groupRepo: IGroupFunctionsRepository =
   new GroupFunctionsRepository(
      firestore as any,
      FieldValue
   ).setGroupEventsHandler(groupEventsHandler)

export const notificationService: INotificationService =
   new NotificationService(apiClient)

export const userRepo: IUserFunctionsRepository = new UserFunctionsRepository(
   firestore as any,
   FieldValue,
   Timestamp,
   notificationService
)

export const rewardsRepo: IRewardRepository = new FirebaseRewardRepository(
   firestore as any,
   FieldValue,
   Timestamp
)

export const fieldOfStudyRepo: IFieldOfStudyRepository =
   new FirebaseFieldOfStudyRepository(firestore as any)

export const universityRepo: IUniversityRepository =
   new FirebaseUniversityRepository(firestore as any)

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
   groupId: string,
   sparksRepo: ISparkFunctionsRepository
): GroupSparksAnalyticsRepository => {
   return new GroupSparksAnalyticsRepository(
      groupId,
      bigQueryClient,
      firestore,
      sparksRepo
   )
}

export const customJobRepo: ICustomJobFunctionsRepository =
   new CustomJobFunctionsRepository(firestore as any, FieldValue)

export const emailNotificationsRepo: IEmailNotificationRepository =
   new EmailNotificationFunctionsRepository(firestore as any)
