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
      async (data, context) => {
         const allRegisteredUsers =
            await livestreamsRepo.getRegisteredUsersMultipleEvents(
               data.livestreamIds
            )

         return allRegisteredUsers
      }
   )
)

/*
|--------------------------------------------------------------------------
| Utils
|--------------------------------------------------------------------------
*/
