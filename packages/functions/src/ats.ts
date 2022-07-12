import functions = require("firebase-functions")
import {
   validateData,
   validateUserAuthExists,
   validateUserIsGroupAdmin,
} from "./lib/validations"
import { object, string } from "yup"
import { groupRepo } from "./api/repositories"
import { MergeATSRepository } from "@careerfairy/shared-lib/dist/ats/MergeATSRepository"
import { logAxiosError } from "./util"
import { GroupATSAccount } from "@careerfairy/shared-lib/dist/groups"

/**
 * This function will be called when the group wants to integrate with an ATS system
 * We'll fetch a link_token from Merge that will be used to show the Merge Link dialog (ATS selector)
 */
export const mergeGenerateLinkToken = functions
   .runWith({ secrets: ["MERGE_ACCESS_KEY"] })
   .https.onCall(async (data, context) => {
      const inputSchema = object({
         groupId: string().required(),
         integrationId: string().required(),
      })

      // validations that throw exceptions
      const { email } = await validateUserAuthExists(context)
      const { groupId, integrationId } = await validateData(data, inputSchema)
      const { group } = await validateUserIsGroupAdmin(groupId, email)

      try {
         const mergeATS = new MergeATSRepository(process.env.MERGE_ACCESS_KEY)

         // Temporary token initializing the user’s integration authorization session
         // We'll be able to open the Merge Link dialog to choose the integration
         return mergeATS.createLinkToken(
            integrationId,
            group.universityName,
            group.adminEmail
         )
      } catch (e) {
         logAxiosError("Failed to create a link token from merge", e)

         return null
      }
   })

/**
 * This is the second step where we exchange a public token with the final group
 * account token (that should be used when querying the merge data for that group)
 */
export const mergeGetAccountToken = functions
   .runWith({ secrets: ["MERGE_ACCESS_KEY"] })
   .https.onCall(async (data, context) => {
      const inputSchema = object({
         groupId: string().required(),
         integrationId: string().required(),
         publicToken: string().required(),
      })

      // validations that throw exceptions
      const { email } = await validateUserAuthExists(context)
      const { groupId, integrationId, publicToken } = await validateData(
         data,
         inputSchema
      )

      await validateUserIsGroupAdmin(groupId, email)

      try {
         const mergeATS = new MergeATSRepository(process.env.MERGE_ACCESS_KEY)

         const mergeResponse = await mergeATS.exchangeAccountToken(publicToken)

         console.log("account token resp", mergeResponse)

         const atsMetadata: Partial<GroupATSAccount> = {
            groupId: groupId,
            merge: {
               end_user_origin_id: integrationId,
               integration_name: mergeResponse?.integration?.name,
               image: mergeResponse?.integration?.image,
               square_image: mergeResponse?.integration?.square_image,
               slug: mergeResponse?.integration?.slug,
            },
         }

         await groupRepo.createATSIntegration(
            groupId,
            integrationId,
            atsMetadata
         )

         await groupRepo.saveATSIntegrationTokens(groupId, integrationId, {
            groupId,
            integrationId,
            merge: {
               account_token: mergeResponse.account_token,
            },
         })
         return true
      } catch (e) {
         logAxiosError(
            "Failed to exchange the public token with the account token",
            e
         )

         throw e
      }
   })
