import functions = require("firebase-functions")
import {
   ATSDataPaginationOptions,
   ATSPaginatedResults,
   RecruitersFunctionCallOptions,
} from "@careerfairy/shared-lib/ats/Functions"
import { Job } from "@careerfairy/shared-lib/ats/Job"
import { Recruiter } from "@careerfairy/shared-lib/ats/Recruiter"
import {
   MergeExtraRequiredData,
   MergeMetaEntities,
} from "@careerfairy/shared-lib/ats/merge/MergeResponseTypes"
import { GroupATSAccountDocument } from "@careerfairy/shared-lib/groups"
import { UserATSRelations, UserData } from "@careerfairy/shared-lib/users"
import { boolean, object, string } from "yup"
import { atsRepo, groupRepo } from "./api/repositories"
import config from "./config"
import {
   atsRequestValidation,
   atsRequestValidationWithAccountToken,
   createJobApplication,
} from "./lib/ats"
import { TEST_CV } from "./lib/merge/MergeATSRepository"
import { getATSRepository } from "./lib/merge/util"
import {
   logAxiosErrorAndThrow,
   serializeModels,
   serializePaginatedModels,
} from "./util"
import { DateTime } from "luxon"

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
   .region(config.region)
   .runWith({ secrets: ["MERGE_ACCESS_KEY"] })
   .https.onCall(async (data, context) => {
      const requestData = await atsRequestValidation({
         data,
         context,
      })

      try {
         const mergeATS = getATSRepository(process.env.MERGE_ACCESS_KEY)

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
   .region(config.region)
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
         const mergeATS = getATSRepository(process.env.MERGE_ACCESS_KEY)

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
 * Fetch the Meta information for a certain entity
 * This is used to show the form fields for the ATS integration
 */
export const mergeMetaEndpoint = functions
   .region(config.region)
   .runWith({ secrets: ["MERGE_ACCESS_KEY"] })
   .https.onCall(async (data, context) => {
      const requestData = await atsRequestValidationWithAccountToken<{
         entity: MergeMetaEntities
      }>({
         data,
         context,
         requiredData: {
            entity: string().required(),
         },
      })

      try {
         const mergeATS = getATSRepository(
            process.env.MERGE_ACCESS_KEY,
            requestData.tokens.merge.account_token
         )

         return await mergeATS.getMetaCreation(requestData.entity)
      } catch (e) {
         return logAxiosErrorAndThrow(
            "Failed to fetch the meta information for the entity",
            e,
            requestData
         )
      }
   })

/**
 * Fetch Jobs
 */
export const fetchATSJobs = functions
   .region(config.region)
   .runWith({ secrets: ["MERGE_ACCESS_KEY"] })
   .https.onCall(async (data, context) => {
      const requestData = await atsRequestValidationWithAccountToken<
         ATSDataPaginationOptions & { allJobs?: boolean }
      >({
         data,
         context,
         requiredData: {
            cursor: string().optional().nullable(),
            pageSize: string().optional().nullable(), // if it's a number, it should be cast to string
            allJobs: boolean().optional().nullable(),
         },
      })

      try {
         const atsRepository = atsRepo(
            process.env.MERGE_ACCESS_KEY,
            requestData.tokens.merge.account_token
         )

         if (requestData.allJobs) {
            return {
               next: null,
               previous: null,
               results: await atsRepository.getAllJobs().then(serializeModels),
            } as ATSPaginatedResults<Job>
         }

         return await atsRepository
            .getJobs({
               cursor: requestData?.cursor,
               pageSize: requestData?.pageSize + "",
            })
            .then(serializePaginatedModels)
      } catch (e) {
         return logAxiosErrorAndThrow(
            "Failed to fetch the account jobs",
            e,
            requestData
         )
      }
   })

export const candidateApplicationTest = functions
   .region(config.region)
   .runWith({ secrets: ["MERGE_ACCESS_KEY"] })
   .https.onCall(async (data, context) => {
      const requestData = await atsRequestValidationWithAccountToken<{
         mergeExtraRequiredData: MergeExtraRequiredData
         jobId: string
      }>({
         data,
         context,
         requiredData: {
            jobId: string().required(),
            mergeExtraRequiredData: object().required(),
         },
      })

      try {
         const atsRepository = atsRepo(
            process.env.MERGE_ACCESS_KEY,
            requestData.tokens.merge.account_token
         )

         const [atsAccount, job] = await Promise.all([
            groupRepo.getATSIntegration(
               requestData.groupId,
               requestData.integrationId
            ),
            atsRepository.getJob(requestData.jobId),
         ])

         // @ts-ignore Set the extra data received
         atsAccount.extraRequiredData = requestData.mergeExtraRequiredData

         // Generate timestamp based unique identifier in the format yyyymmddHHMMSS (e.g., 20230626130555)
         const timestamp = DateTime.utc().toFormat("yyyyMMddHHmmss")

         // Dummy candidate that we'll create
         const userData = {
            firstName: "User",
            lastName: "CareerFairy",
            userResume: TEST_CV,
            userEmail: `application-test-${timestamp}@careerfairy.io`,
         } as UserData

         let relations: UserATSRelations = {}

         relations = await createJobApplication(
            job,
            userData,
            atsRepository,
            atsAccount,
            relations
         )

         return relations.jobApplications[job.id]
      } catch (e) {
         return logAxiosErrorAndThrow(
            "Failed to create the test application",
            e,
            requestData
         )
      }
   })

/**
 * Fetch Recruiters
 */
export const fetchATSRecruiters = functions
   .region(config.region)
   .runWith({ secrets: ["MERGE_ACCESS_KEY"] })
   .https.onCall(async (data, context) => {
      const requestData =
         await atsRequestValidationWithAccountToken<RecruitersFunctionCallOptions>(
            {
               data,
               context,
               requiredData: {
                  cursor: string().optional().nullable(),
                  pageSize: string().optional().nullable(), // if it's a number, it should be cast to string
                  all: boolean().optional().nullable(),
                  email: string().optional().nullable(),
               },
            }
         )

      try {
         const atsRepository = atsRepo(
            process.env.MERGE_ACCESS_KEY,
            requestData.tokens.merge.account_token
         )

         if (requestData.all) {
            return {
               next: null,
               previous: null,
               results: await atsRepository
                  .getAllRecruiters()
                  .then(serializeModels),
            } as ATSPaginatedResults<Recruiter>
         }

         return await atsRepository
            .getRecruiters({
               cursor: requestData?.cursor,
               pageSize: requestData?.pageSize + "",
               email: requestData?.email,
            })
            .then(serializePaginatedModels)
      } catch (e) {
         return logAxiosErrorAndThrow(
            "Failed to fetch the recruiters",
            e,
            requestData
         )
      }
   })

/**
 * Sync Status for the multiple entities
 */
export const fetchATSSyncStatus = functions
   .region(config.region)
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
   .region(config.region)
   .runWith({ secrets: ["MERGE_ACCESS_KEY"] })
   .https.onCall(async (data, context) => {
      const requestData = await atsRequestValidationWithAccountToken({
         data,
         context,
      })

      try {
         const mergeATS = getATSRepository(
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
