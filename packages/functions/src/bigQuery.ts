import functions = require("firebase-functions")
import { BigQueryUserQueryOptions } from "@careerfairy/shared-lib/bigQuery/types"
import { onCall } from "firebase-functions/https"
import { bigQueryRepo } from "./api/repositories"
import { userIsSignedInAndIsCFAdmin } from "./lib/validations"

/**
 * Get Users
 */
export const getBigQueryUsers = onCall<BigQueryUserQueryOptions>(
   {
      secrets: ["MERGE_ACCESS_KEY"],
   },
   async (request) => {
      await userIsSignedInAndIsCFAdmin(request)
      try {
         return await bigQueryRepo.getUsers(
            request.data.page,
            request.data.limit,
            request.data.orderBy,
            request.data.sortOrder,
            request.data?.filters
         )
      } catch (e) {
         functions.logger.error("ERROR in get big query users", e)
         throw new functions.https.HttpsError("unknown", e)
      }
   }
)
