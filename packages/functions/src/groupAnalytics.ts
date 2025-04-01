import functions = require("firebase-functions")
import {
   FETCH_TYPES,
   registrationSourcesCacheKey,
   RegistrationSourcesResponseItem,
} from "@careerfairy/shared-lib/functions/groupAnalyticsTypes"
import { UserLivestreamData } from "@careerfairy/shared-lib/livestreams"
import { CallableRequest, onCall } from "firebase-functions/https"
import { array, string } from "yup"
import { livestreamsRepo } from "./api/repositories"
import {
   CacheKeyOnCallFn,
   cacheOnCallValues,
} from "./middlewares/cacheMiddleware"
import { middlewares } from "./middlewares/middlewares"
import {
   dataValidation,
   userShouldBeGroupAdmin,
} from "./middlewares/validations"

/*
|--------------------------------------------------------------------------
| Functions to calculate group analytics
|--------------------------------------------------------------------------
*/

// cache settings for all functions in this file
const cache = (cacheKeyFn: CacheKeyOnCallFn) =>
   cacheOnCallValues("analytics", cacheKeyFn, 300) // 5min

/**
 * Fetch Group Registration Sources Analytics
 */
export const getRegistrationSources = onCall(
   {
      secrets: ["MERGE_ACCESS_KEY"],
   },
   middlewares(
      dataValidation({
         groupId: string().required(),
         livestreamIds: array(string()).optional(),
         fetchType: string()
            .oneOf([...FETCH_TYPES])
            .optional(),
      }),
      userShouldBeGroupAdmin(),
      cache((data) => registrationSourcesCacheKey({ ...data })),
      async (
         request: CallableRequest<{
            groupId: string
            livestreamIds: string[]
            fetchType: (typeof FETCH_TYPES)[number]
         }>
      ) => {
         const type = request.data.fetchType

         let userLivestreamData: UserLivestreamData[] = []
         switch (type) {
            case "ALL_LIVESTREAMS": {
               const livestreams = await livestreamsRepo.getEventsOfGroup(
                  request.data.groupId
               )

               userLivestreamData =
                  await livestreamsRepo.getRegisteredUsersMultipleEvents(
                     livestreams.map((l) => l.id)
                  )

               break
            }

            // fallback to livestreamIds
            default:
               userLivestreamData =
                  await livestreamsRepo.getRegisteredUsersMultipleEvents(
                     request.data.livestreamIds
                  )
         }

         functions.logger.info(
            `Fetched ${userLivestreamData.length} userLivestreamData docs`
         )

         // remove unwanted fields to save bandwidth
         // (smaller responses are more likely to fit in cache due to the 1MB limit)
         const stats: RegistrationSourcesResponseItem[] =
            userLivestreamData.map(RegistrationSourcesResponseItem.serialize)

         return stats
      }
   )
)
