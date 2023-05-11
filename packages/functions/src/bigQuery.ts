import functions = require("firebase-functions")
import { bigQueryRepo } from "./api/repositories"
import { userIsSignedInAndIsCFAdmin } from "./lib/validations"
import { BigQueryUserQueryOptions } from "@careerfairy/shared-lib/bigQuery/types"
import config from "./config"

/**
 * Get Users
 */
export const getBigQueryUsers = functions
   .region(config.region)
   .https.onCall(async (data: BigQueryUserQueryOptions, context) => {
      await userIsSignedInAndIsCFAdmin(context)
      try {
         return await bigQueryRepo.getUsers(
            data.page,
            data.limit,
            data.orderBy,
            data.sortOrder,
            data?.filters
         )
      } catch (e) {
         functions.logger.error("ERROR in get big query users", e)
         throw new functions.https.HttpsError("unknown", e)
      }
   })
