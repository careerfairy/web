import functions = require("firebase-functions")
import { bigQueryRepo } from "./api/repositories"
import { bigQueryRequestValidation } from "./lib/validations"

/**
 * Get Users
 */
export const getBigQueryUsers = functions.https.onCall(
   async (data, context) => {
      await bigQueryRequestValidation(context)
      try {
         return await bigQueryRepo.getUsers(
            data.page,
            data.limit,
            data.orderBy,
            data.sortOrder,
            data.universityCountryCodes,
            data.universityName,
            data.fieldOfStudyIds,
            data.levelOfStudyIds
         )
      } catch (e) {
         functions.logger.error("ERROR in get big query users", e)
         throw new functions.https.HttpsError("unknown", e)
      }
   }
)
