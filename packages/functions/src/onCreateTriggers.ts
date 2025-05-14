import {
   EventRatingAnswer,
   UserLivestreamData,
} from "@careerfairy/shared-lib/livestreams"
import { PopularityEventData } from "@careerfairy/shared-lib/livestreams/popularity"
import { RewardDoc } from "@careerfairy/shared-lib/rewards"
import { UserData, pickPublicDataFromUser } from "@careerfairy/shared-lib/users"
import * as functions from "firebase-functions"
import { logger } from "firebase-functions/v2"
import {
   onDocumentCreated,
   onDocumentUpdated,
} from "firebase-functions/v2/firestore"
import { livestreamsRepo, sparkRepo, userRepo } from "./api/repositories"
import { rewardApply, rewardLivestreamRegistrant } from "./lib/reward"
import {
   defaultTriggerRunTimeConfig,
   handleSideEffects,
} from "./lib/triggers/util"

export const onCreateLivestreamPopularityEvents = onDocumentCreated(
   "livestreams/{livestreamId}/popularityEvents/{eventId}",
   async (event) => {
      functions.logger.info(event.params)

      const popularityDoc: PopularityEventData = {
         ...(event.data.data() as PopularityEventData),
         id: event.data.id,
      }

      if (event.params.livestreamId === "6QaE8TNhzEFMoQISBRKT") {
         functions.logger.info(
            "Skipping updating popularity for World Bank Live stream"
         )
         return
      }

      // An array of promise side effects to be executed in parallel
      const sideEffectPromises: Promise<unknown>[] = []

      // Run side effects for all livestream changes
      sideEffectPromises.push(
         livestreamsRepo.updateLivestreamPopularity(popularityDoc)
      )
      return handleSideEffects(sideEffectPromises)
   }
)

export const onCreateLivestreamRatingAnswer = onDocumentCreated(
   "livestreams/{livestreamId}/rating/{ratingName}/voters/{userEmail}",
   async (event) => {
      functions.logger.info(event.params)

      const { livestreamId, ratingName } = event.params

      const ratingDoc: EventRatingAnswer = {
         ...(event.data.data() as EventRatingAnswer),
         id: event.data.id,
      }

      // An array of promise side effects to be executed in parallel
      const sideEffectPromises: Promise<unknown>[] = []

      // Run side effects for all livestream changes
      sideEffectPromises.push(
         livestreamsRepo.syncLiveStreamStatsNewRating(
            livestreamId,
            ratingName,
            ratingDoc
         )
      )

      return handleSideEffects(sideEffectPromises)
   }
)

export const onCreateUserData = onDocumentCreated(
   "userData/{userId}",
   async (event) => {
      logger.info(event.params)

      const userData: UserData = {
         ...(event.data.data() as UserData),
         id: event.params.userId,
      }

      // An array of promise side effects to be executed in parallel
      const sideEffectPromises: Promise<unknown>[] = []

      // Run side effects for every new userData doc
      sideEffectPromises.push(
         userRepo.createActivity(
            pickPublicDataFromUser(userData),
            "createdAt",
            false // we already set the lastActivityDate when creating the doc
         )
      )

      // No need to check if application has been synched since the user was just created
      // so synching cannot have been already done
      sideEffectPromises.push(
         userRepo.migrateAnonymousJobApplications(userData)
      )

      return handleSideEffects(sideEffectPromises)
   }
)

export const onUpdateUserData = onDocumentUpdated(
   {
      ...defaultTriggerRunTimeConfig,
      document: "userData/{userId}",
   },
   async (event) => {
      functions.logger.info(event.params)

      const userData: UserData = event.data.after.data() as UserData

      if (!userData) return

      // An array of promise side effects to be executed in parallel
      const sideEffectPromises: Promise<unknown>[] = []

      sideEffectPromises.push(userRepo.updateJobApplicationsUserData(userData))

      return handleSideEffects(sideEffectPromises)
   }
)

export const onCreateUserLivestreamData = onDocumentCreated(
   "livestreams/{livestreamId}/userLivestreamData/{userEmail}",
   async (event) => {
      functions.logger.info(event.params)

      const livestreamId = event.params.livestreamId
      const userEmail = event.params.userEmail
      const doc: UserLivestreamData = {
         ...(event.data.data() as UserLivestreamData),
         id: event.data.id,
      }

      // An array of promise side effects to be executed in parallel
      const sideEffectPromises: Promise<unknown>[] = []

      // Run side effects for every new doc
      sideEffectPromises.push(
         rewardLivestreamRegistrant(doc, livestreamId, userEmail)
      )

      return handleSideEffects(sideEffectPromises)
   }
)

export const onCreateReward = onDocumentCreated(
   "userData/{userEmail}/rewards/{rewardId}",
   async (event) => {
      functions.logger.info(event.params)

      const email = event.params.userEmail
      const rewardDoc: RewardDoc = {
         ...(event.data.data() as RewardDoc),
         id: event.data.id,
      }

      // An array of promise side effects to be executed in parallel
      const sideEffectPromises: Promise<unknown>[] = []

      // Run side effects for every new doc
      sideEffectPromises.push(rewardApply(rewardDoc, email))

      return handleSideEffects(sideEffectPromises)
   }
)

export const onCreateUserSparkFeed = onDocumentCreated(
   "userData/{userEmail}/sparksFeed/{sparkId}",
   async (event) => {
      functions.logger.info(event.params)

      const userEmail = event.params.userEmail
      const sparkId = event.params.sparkId

      functions.logger.info(
         `SparkId: ${sparkId} was added to ${userEmail} feed`
      )

      // An array of promise side effects to be executed in parallel
      const sideEffectPromises: Promise<unknown>[] = []

      sideEffectPromises.push(
         sparkRepo.incrementFeedCount(userEmail, "increment")
      )

      return handleSideEffects(sideEffectPromises)
   }
)

export const onCreateSparkStats = onDocumentCreated(
   "sparkStats/{sparkId}",
   async (event) => {
      functions.logger.info(event.params)

      const sparkId = event.params.sparkId

      functions.logger.info(`Spark Stats for SparkId: ${sparkId} was created.`)

      // An array of promise side effects to be executed in parallel
      const sideEffectPromises: Promise<unknown>[] = []

      sideEffectPromises.push(
         sparkRepo.addSparkToSparkStatsDocument(sparkId, event.data)
      )

      return handleSideEffects(sideEffectPromises)
   }
)
