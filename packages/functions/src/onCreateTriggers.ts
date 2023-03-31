import * as functions from "firebase-functions"
import {
   handleSideEffects,
   defaultTriggerRunTimeConfig,
} from "./lib/triggers/util"
import config from "./config"
import { livestreamsRepo, userRepo } from "./api/repositories"
import { PopularityEventData } from "@careerfairy/shared-lib/livestreams/popularity"
import { EventRatingAnswer } from "@careerfairy/shared-lib/livestreams"
import { pickPublicDataFromUser, UserData } from "@careerfairy/shared-lib/users"

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
