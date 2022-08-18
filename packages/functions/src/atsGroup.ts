import functions = require("firebase-functions")
import { string } from "yup"
import { atsRepo, groupRepo } from "./api/repositories"
import { MergeATSRepository } from "@careerfairy/shared-lib/dist/ats/MergeATSRepository"
import { logAxiosErrorAndThrow, serializeModels } from "./util"
import { GroupATSAccountDocument } from "@careerfairy/shared-lib/dist/groups"
import {
   atsRequestValidation,
   atsRequestValidationWithAccountToken,
} from "./lib/ats"

/*
|--------------------------------------------------------------------------
| ATS Functions related to Group operations
|--------------------------------------------------------------------------
*/

/**
 * This function will be called when the group wants to integrate with an ATS system
 * We'll fetch a link_token from Merge that will be used to show the Merge Link dialog (ATS selector)
 */
export const mergeGenerateLinkToken = functions
   .runWith({ secrets: ["MERGE_ACCESS_KEY"] })
   .https.onCall(async (data, context) => {
      const requestData = await atsRequestValidation({
         data,
         context,
      })

      try {
         const mergeATS = new MergeATSRepository(process.env.MERGE_ACCESS_KEY)

         // Temporary token initializing the user’s integration authorization session
         // We'll be able to open the Merge Link dialog to choose the integration
         return await mergeATS.createLinkToken(
            requestData.integrationId,
            requestData.group.universityName,
            requestData.idToken.email
         )
      } catch (e) {
         return logAxiosErrorAndThrow(
            "Failed to create a link token from merge",
            e,
            requestData
         )
      }
   })

/**
 * This is the second step where we exchange a public token with the final group
 * account token (that should be used when querying the merge data for that group)
 */
export const mergeGetAccountToken = functions
   .runWith({ secrets: ["MERGE_ACCESS_KEY"] })
   .https.onCall(async (data, context) => {
      const requestData = await atsRequestValidation<{ publicToken: string }>({
         data,
         context,
         requiredData: {
            publicToken: string().required(),
         },
      })

      try {
         const mergeATS = new MergeATSRepository(process.env.MERGE_ACCESS_KEY)

         const mergeResponse = await mergeATS.exchangeAccountToken(
            requestData.publicToken
         )

         const atsMetadata: Partial<GroupATSAccountDocument> = {
            groupId: requestData.groupId,
            merge: {
               end_user_origin_id: requestData.integrationId,
               integration_name: mergeResponse?.integration?.name,
               image: mergeResponse?.integration?.image,
               square_image: mergeResponse?.integration?.square_image,
               slug: mergeResponse?.integration?.slug,
            },
         }

         await groupRepo.createATSIntegration(
            requestData.groupId,
            requestData.integrationId,
            atsMetadata
         )

         await groupRepo.saveATSIntegrationTokens(
            requestData.groupId,
            requestData.integrationId,
            {
               groupId: requestData.groupId,
               integrationId: requestData.integrationId,
               merge: {
                  account_token: mergeResponse.account_token,
               },
            }
         )

         return true
      } catch (e) {
         return logAxiosErrorAndThrow(
            "Failed to exchange the public token with the account token",
            e,
            requestData
         )
      }
   })

/**
 * Fetch Jobs
 */
export const fetchATSJobs = functions
   .runWith({ secrets: ["MERGE_ACCESS_KEY"] })
   .https.onCall(async (data, context) => {
      const requestData = await atsRequestValidationWithAccountToken({
         data,
         context,
         requiredData: {},
      })

      try {
         const atsRepository = atsRepo(
            process.env.MERGE_ACCESS_KEY,
            requestData.tokens.merge.account_token
         )

         return await atsRepository.getJobs().then(serializeModels)
      } catch (e) {
         return logAxiosErrorAndThrow(
            "Failed to fetch the account jobs",
            e,
            requestData
         )
      }
   })

/**
 * Fetch Job Applications
 * Possibility to filter by job id
 */
export const fetchATSApplications = functions
   .runWith({ secrets: ["MERGE_ACCESS_KEY"] })
   .https.onCall(async (data, context) => {
      const requestData = await atsRequestValidationWithAccountToken<{
         jobId?: string
      }>({
         data,
         context,
         requiredData: {
            jobId: string().optional().nullable(),
         },
      })

      try {
         const atsRepository = atsRepo(
            process.env.MERGE_ACCESS_KEY,
            requestData.tokens.merge.account_token
         )

         return await atsRepository
            .getApplications(requestData.jobId)
            .then(serializeModels)
      } catch (e) {
         return logAxiosErrorAndThrow(
            "Failed to fetch the account applications",
            e,
            requestData
         )
      }
   })

/**
 * Sync Status for the multiple entities
 */
export const fetchATSSyncStatus = functions
   .runWith({ secrets: ["MERGE_ACCESS_KEY"] })
   .https.onCall(async (data, context) => {
      const requestData = await atsRequestValidationWithAccountToken({
         data,
         context,
      })

      try {
         const atsRepository = atsRepo(
            process.env.MERGE_ACCESS_KEY,
            requestData.tokens.merge.account_token
         )

         return await atsRepository.getSyncStatus().then(serializeModels)
      } catch (e) {
         return logAxiosErrorAndThrow(
            "Failed to fetch the merge sync status",
            e,
            requestData
         )
      }
   })

/**
 * Remove a linked account from merge
 */
export const mergeRemoveAccount = functions
   .runWith({ secrets: ["MERGE_ACCESS_KEY"] })
   .https.onCall(async (data, context) => {
      const requestData = await atsRequestValidationWithAccountToken({
         data,
         context,
      })

      try {
         const mergeATS = new MergeATSRepository(
            process.env.MERGE_ACCESS_KEY,
            requestData.tokens.merge.account_token
         )

         await mergeATS.removeAccount()
      } catch (e) {
         return logAxiosErrorAndThrow(
            "Failed to remove ATS account",
            e,
            requestData
         )
      }

      // delete ats docs
      await groupRepo.removeATSIntegration(
         requestData.groupId,
         requestData.integrationId
      )

      return true
   })
