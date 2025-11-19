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
import {
   IStripeFunctionsRepository,
   StripeFunctionsRepository,
} from "../lib/stripe"

import { IPublicSparksNotificationsRepository } from "@careerfairy/shared-lib/sparks/public-notifications/IPublicSparksNotificationsRepository"
import PublicSparksNotificationsRepository from "@careerfairy/shared-lib/sparks/public-notifications/PublicSparksNotificationsRepository"
import { StripeEnvironment } from "@careerfairy/shared-lib/stripe/types"
import Stripe from "stripe"
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
import { CustomerIOObjectsClient } from "../lib/customerio/objectsClient"
import { CustomerIORelationshipsClient } from "../lib/customerio/relationshipsClient"
import {
   INotificationService,
   NotificationService,
} from "../lib/notifications/NotificationService"
import {
   IOfflineEventFunctionsRepository,
   OfflineEventFunctionsRepository,
} from "../lib/offline-events/OfflineEventFunctionsRepository"
import RecordingAnalyticsRepository from "../lib/recordings/analytics/RecordingAnalyticsRepository"
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

export const objectsClient = new CustomerIOObjectsClient()

export const relationshipsClient = new CustomerIORelationshipsClient()

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

export const getRecordingAnalyticsRepoInstance =
   (): RecordingAnalyticsRepository => {
      return new RecordingAnalyticsRepository(bigQueryClient)
   }

export const customJobRepo: ICustomJobFunctionsRepository =
   new CustomJobFunctionsRepository(firestore as any, FieldValue)

export const emailNotificationsRepo: IEmailNotificationRepository =
   new EmailNotificationFunctionsRepository(firestore as any)

export const offlineEventRepo: IOfflineEventFunctionsRepository =
   new OfflineEventFunctionsRepository(firestore, logger)

// Cache for repository instances to avoid recreating them
const stripeRepoCache: Partial<
   Record<StripeEnvironment, IStripeFunctionsRepository>
> = {}

export const getStripeRepoInstance = (
   environment: StripeEnvironment
): IStripeFunctionsRepository => {
   // Return cached instance if available
   const cachedRepo = stripeRepoCache[environment]
   if (cachedRepo) {
      return cachedRepo
   }

   // Validate and get the appropriate API key
   let apiKey: string | undefined
   if (environment === "prod") {
      apiKey = process.env.STRIPE_SECRET_KEY
      if (!apiKey) {
         throw new Error(
            "STRIPE_SECRET_KEY environment variable is not set. Required for production Stripe environment."
         )
      }
   } else {
      apiKey = process.env.TEST_STRIPE_SECRET_KEY
      if (!apiKey) {
         throw new Error(
            "TEST_STRIPE_SECRET_KEY environment variable is not set. Required for test Stripe environment."
         )
      }
   }

   // Create Stripe instance and repository
   const stripe = new Stripe(apiKey)
   const repo = new StripeFunctionsRepository(stripe)

   // Cache the repository instance
   stripeRepoCache[environment] = repo

   return repo
}
