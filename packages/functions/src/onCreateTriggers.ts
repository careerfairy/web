import * as functions from "firebase-functions"
import {
   handleSideEffects,
   defaultTriggerRunTimeConfig,
} from "./lib/triggers/util"
import config from "./config"
import { livestreamsRepo } from "./api/repositories"
import { PopularityEventData } from "@careerfairy/shared-lib/livestreams/popularity"

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
