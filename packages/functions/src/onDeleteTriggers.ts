import { PopularityEventData } from "@careerfairy/shared-lib/livestreams/popularity"
import * as functions from "firebase-functions"
import { onDocumentDeleted } from "firebase-functions/firestore"
import { customJobRepo, livestreamsRepo, sparkRepo } from "./api/repositories"
import { handleSideEffects } from "./lib/triggers/util"

export const onDeleteLivestreamPopularityEvents = onDocumentDeleted(
   "livestreams/{livestreamId}/popularityEvents/{eventId}",
   async (event) => {
      functions.logger.info(event.params)

      const popularityDoc: PopularityEventData = {
         ...(event.data?.data() as PopularityEventData),
         id: event.data?.id,
      }

      // An array of promise side effects to be executed in parallel
      const sideEffectPromises: Promise<unknown>[] = []

      // Run side effects for all livestream changes
      sideEffectPromises.push(
         livestreamsRepo.updateLivestreamPopularity(popularityDoc, true)
      )

      return handleSideEffects(sideEffectPromises)
   }
)

export const onDeleteUserSparkFeed = onDocumentDeleted(
   "userData/{userEmail}/sparksFeed/{sparkId}",
   async (event) => {
      functions.logger.info(event.params)

      const userEmail = event.params.userEmail
      const sparkId = event.params.sparkId

      functions.logger.info(`Spark ${sparkId} was deleted for ${userEmail}`)

      // An array of promise side effects to be executed in parallel
      const sideEffectPromises: Promise<unknown>[] = []

      sideEffectPromises.push(
         sparkRepo.incrementFeedCount(userEmail, "decrement")
      )

      return handleSideEffects(sideEffectPromises)
   }
)

export const onDeleteDraft = onDocumentDeleted(
   "draftLivestreams/{livestreamId}",
   async (event) => {
      functions.logger.info(event.params)

      const livestreamId = event.params.livestreamId

      functions.logger.info(`Draft ${livestreamId} was deleted`)

      // An array of promise side effects to be executed in parallel
      const sideEffectPromises: Promise<unknown>[] = []

      sideEffectPromises.push(
         customJobRepo.removeLinkedLivestream(livestreamId)
      )

      return handleSideEffects(sideEffectPromises)
   }
)
