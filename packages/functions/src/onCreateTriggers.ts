import * as functions from "firebase-functions"
import {
   handleSideEffects,
   defaultTriggerRunTimeConfig,
} from "./lib/triggers/util"
import config from "./config"
import { livestreamsRepo, sparkRepo, userRepo } from "./api/repositories"
import { PopularityEventData } from "@careerfairy/shared-lib/livestreams/popularity"
import {
   EventRatingAnswer,
   UserLivestreamData,
} from "@careerfairy/shared-lib/livestreams"
import { pickPublicDataFromUser, UserData } from "@careerfairy/shared-lib/users"
import { RewardDoc } from "@careerfairy/shared-lib/rewards"
import { rewardApply, rewardLivestreamRegistrant } from "./lib/reward"

export const onCreateLivestreamPopularityEvents = functions
   .runWith(defaultTriggerRunTimeConfig)
   .region(config.region)
   .firestore.document("livestreams/{livestreamId}/popularityEvents/{eventId}")
   .onCreate(async (snapshot, context) => {
      functions.logger.info(context.params)

      const popularityDoc: PopularityEventData = {
         ...(snapshot.data() as PopularityEventData),
         id: snapshot.id,
      }

      // An array of promise side effects to be executed in parallel
      const sideEffectPromises: Promise<unknown>[] = []

      // Run side effects for all livestream changes
      sideEffectPromises.push(
         livestreamsRepo.updateLivestreamPopularity(popularityDoc)
      )

      return handleSideEffects(sideEffectPromises)
   })

export const onCreateLivestreamRatingAnswer = functions
   .runWith(defaultTriggerRunTimeConfig)
   .region(config.region)
   .firestore.document(
      "livestreams/{livestreamId}/rating/{ratingName}/voters/{userEmail}"
   )
   .onCreate(async (snapshot, context) => {
      functions.logger.info(context.params)

      const { livestreamId, ratingName } = context.params

      const ratingDoc: EventRatingAnswer = {
         ...(snapshot.data() as EventRatingAnswer),
         id: snapshot.id,
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
   })

export const onCreateUserData = functions
   .runWith(defaultTriggerRunTimeConfig)
   .region(config.region)
   .firestore.document("userData/{userId}")
   .onCreate(async (snapshot, context) => {
      functions.logger.info(context.params)

      const userData: UserData = {
         ...(snapshot.data() as UserData),
         id: snapshot.id,
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

      return handleSideEffects(sideEffectPromises)
   })

export const onCreateUserLivestreamData = functions
   .runWith(defaultTriggerRunTimeConfig)
   .region(config.region)
   .firestore.document(
      "livestreams/{livestreamId}/userLivestreamData/{userEmail}"
   )
   .onCreate(async (snapshot, context) => {
      functions.logger.info(context.params)

      const livestreamId = context.params.livestreamId
      const userEmail = context.params.userEmail
      const doc: UserLivestreamData = {
         ...(snapshot.data() as UserLivestreamData),
         id: snapshot.id,
      }

      // An array of promise side effects to be executed in parallel
      const sideEffectPromises: Promise<unknown>[] = []

      // Run side effects for every new doc
      sideEffectPromises.push(
         rewardLivestreamRegistrant(doc, livestreamId, userEmail)
      )

      return handleSideEffects(sideEffectPromises)
   })

export const onCreateReward = functions
   .runWith(defaultTriggerRunTimeConfig)
   .region(config.region)
   .firestore.document("userData/{userEmail}/rewards/{rewardId}")
   .onCreate(async (snapshot, context) => {
      functions.logger.info(context.params)

      const email = context.params.userEmail
      const rewardDoc: RewardDoc = {
         ...(snapshot.data() as RewardDoc),
         id: snapshot.id,
      }

      // An array of promise side effects to be executed in parallel
      const sideEffectPromises: Promise<unknown>[] = []

      // Run side effects for every new doc
      sideEffectPromises.push(rewardApply(rewardDoc, email))

      return handleSideEffects(sideEffectPromises)
   })

export const onCreateUserSparkFeed = functions
   .runWith(defaultTriggerRunTimeConfig)
   .region(config.region)
   .firestore.document("userData/{userEmail}/sparksFeed/{sparkId}")
   .onCreate(async (change, context) => {
      functions.logger.info(context.params)

      const userEmail = context.params.userEmail
      const sparkId = context.params.sparkId

      functions.logger.info(
         `SparkId: ${sparkId} was added to ${userEmail} feed`
      )

      // An array of promise side effects to be executed in parallel
      const sideEffectPromises: Promise<unknown>[] = []

      sideEffectPromises.push(
         sparkRepo.incrementFeedCount(userEmail, "increment")
      )

      return handleSideEffects(sideEffectPromises)
   })

export const onCreateSparkStats = functions
   .runWith(defaultTriggerRunTimeConfig)
   .region(config.region)
   .firestore.document("sparkStats/{sparkId}")
   .onCreate(async (snapShot, context) => {
      functions.logger.info(context.params)

      const sparkId = context.params.sparkId

      functions.logger.info(`Spark Stats for SparkId: ${sparkId} was created.`)

      // An array of promise side effects to be executed in parallel
      const sideEffectPromises: Promise<unknown>[] = []

      sideEffectPromises.push(
         sparkRepo.addSparkToSparkStatsDocument(sparkId, snapShot)
      )

      return handleSideEffects(sideEffectPromises)
   })
