import functions = require("firebase-functions")
import { middlewares } from "./middlewares/middlewares"
import {
   CacheKeyOnCallFn,
   cacheOnCallValues,
} from "./middlewares/cacheMiddleware"
import {
   dataValidation,
   userShouldBeGroupAdmin,
} from "./middlewares/validations"
import { array, string } from "yup"
import { livestreamsRepo } from "./api/repositories"
import {
   FETCH_TYPES,
   registrationSourcesCacheKey,
   RegistrationSourcesResponseItem,
} from "@careerfairy/shared-lib/functions/groupAnalyticsTypes"
import { UserLivestreamData } from "@careerfairy/shared-lib/livestreams"
import config from "./config"

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
export const getRegistrationSources = functions
   .region(config.region)
   .https.onCall(
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
         async (data) => {
            const type: (typeof FETCH_TYPES)[number] = data.fetchType

            let userLivestreamData: UserLivestreamData[] = []
            switch (type) {
               case "ALL_LIVESTREAMS": {
                  const livestreams = await livestreamsRepo.getEventsOfGroup(
                     data.groupId
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
                        data.livestreamIds
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
