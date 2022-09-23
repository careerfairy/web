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
import { RegistrationSourcesResponseItem } from "@careerfairy/shared-lib/dist/functions/groupAnalyticsTypes"

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
export const getRegistrationSources = functions.https.onCall(
   middlewares(
      dataValidation({
         groupId: string().required(),
         livestreamIds: array(string()).required(),
      }),
      userShouldBeGroupAdmin(),
      cache((data) => [
         "getRegistrationSources",
         data.groupId,
         data.livestreamIds,
      ]),
      async (data) => {
         const allRegisteredUsers =
            await livestreamsRepo.getRegisteredUsersMultipleEvents(
               data.livestreamIds
            )

         functions.logger.info(
            `Fetched ${allRegisteredUsers} userLivestreamData docs`
         )

         // remove unwanted fields to save bandwidth
         // (smaller responses are more likely to fit in cache due to the 1MB limit)
         const stats: RegistrationSourcesResponseItem[] =
            allRegisteredUsers.map(RegistrationSourcesResponseItem.serialize)

         return stats
      }
   )
)
