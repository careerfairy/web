import functions = require("firebase-functions")
import {
   logAndThrow,
   validateData,
   validateUserAuthExists,
   validateUserIsGroupAdmin,
} from "./lib/validations"
import { object, string } from "yup"
import { atsRepo, groupRepo, userRepo } from "./api/repositories"
import { MergeATSRepository } from "@careerfairy/shared-lib/dist/ats/MergeATSRepository"
import { logAxiosErrorAndThrow, onCallWrapper } from "./util"
import {
   Group,
   GroupATSAccountDocument,
   GroupATSIntegrationTokensDocument,
} from "@careerfairy/shared-lib/dist/groups"
import { CallableContext } from "firebase-functions/lib/common/providers/https"
import { auth } from "firebase-admin"
import DecodedIdToken = auth.DecodedIdToken
import { BaseModel } from "@careerfairy/shared-lib/dist/BaseModel"
import { Job } from "@careerfairy/shared-lib/dist/ats/Job"
import { Candidate } from "@careerfairy/shared-lib/dist/ats/Candidate"
import { UserATSDocument } from "@careerfairy/shared-lib/dist/users"

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
 * Apply a user to a job
 */
export const atsUserApplyToJob = functions
   .runWith({ secrets: ["MERGE_ACCESS_KEY"] })
   .https.onCall(
      onCallWrapper(async (data, context) => {
         const { tokens, idToken, integrationId, jobId } =
            await atsRequestValidationWithAccountToken<{
               jobId?: string
            }>({
               data,
               context,
               requiredData: {
                  jobId: string().required(),
               },
            })

         const atsRepository = atsRepo(
            process.env.MERGE_ACCESS_KEY,
            tokens.merge.account_token
         )

         // Confirm if the user has already applied to this job

         const userATSData: UserATSDocument = await userRepo.getUserATSData(
            idToken.email
         )
         const atsRelations = userATSData?.atsRelations?.[integrationId]

         if (atsRelations?.jobApplications?.[jobId]) {
            return "User has already applied for that job"
         }

         // Create the necessary ATS models to apply the user to the job

         const job: Job = await atsRepository.getJob(jobId)

         if (!job) {
            return logAndThrow("That job does not exit", jobId)
         }

         const userData = await userRepo.getUserDataById(idToken.email)

         // Fetch or create a Candidate object
         let candidate: Candidate
         if (atsRelations?.candidateId) {
            candidate = await atsRepository.getCandidate(
               atsRelations.candidateId
            )
         } else {
            // create
            candidate = await atsRepository.createCandidate(userData)

            // associate the candidate with the user
            await userRepo.associateATSData(idToken.email, integrationId, {
               candidateId: candidate.id,
            })
         }

         // Associate CV resume if existent (and not associated already)
         if (userData.userResume && !atsRelations?.cvAttachmentId) {
            const attachmentId = await atsRepository.candidateAddCVAttachment(
               candidate.id,
               userData.userResume
            )

            await userRepo.associateATSData(idToken.email, integrationId, {
               cvAttachmentId: attachmentId,
            })
         }

         // Create the application
         const applicationId = await atsRepository.createApplication(
            candidate.id,
            jobId
         )

         await userRepo.associateATSData(idToken.email, integrationId, {
            jobApplications: {
               [jobId]: applicationId,
            },
         })

         return applicationId
      })
   )

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

/*
|--------------------------------------------------------------------------
| Utilities & Validations
|--------------------------------------------------------------------------
*/

type AlwaysPresentData = {
   groupId: string
   integrationId: string
}

type AlwaysPresentArgs = AlwaysPresentData & {
   idToken: DecodedIdToken
   group: Group
}

type Options<T extends object> = {
   data: T & AlwaysPresentData
   context: CallableContext
   requiredData?: object
}

/**
 * Common Logic to validate ATS Requests
 *
 * Returns the data fetched from the validations
 * @param options
 */
async function atsRequestValidation<T extends object>(
   options: Options<T>
): Promise<T & AlwaysPresentArgs> {
   const inputSchema = object(
      Object.assign(
         {
            groupId: string().required(),
            integrationId: string().required(),
         },
         options.requiredData ?? {}
      )
   )

   // validations that throw exceptions
   const idToken = await validateUserAuthExists(options.context)
   const inputValidationResult = (await validateData(
      options.data,
      inputSchema
   )) as T & AlwaysPresentData

   const { group } = await validateUserIsGroupAdmin(
      inputValidationResult.groupId,
      idToken.email
   )

   return {
      ...inputValidationResult,
      idToken,
      group,
   }
}

/**
 * Extends the validation above and also fetches the account tokens
 * @param options
 */
async function atsRequestValidationWithAccountToken<T extends object>(
   options: Options<T>
): Promise<
   T & AlwaysPresentArgs & { tokens: GroupATSIntegrationTokensDocument }
> {
   const data = await atsRequestValidation(options)

   // fetch account tokens (required to request information on behalf of the company)
   const accountTokens = await groupRepo.getATSIntegrationTokens(
      data.groupId,
      data.integrationId
   )
   if (!accountTokens) {
      logAndThrow("The requested integration is missing the account tokens", {
         groupId: data.groupId,
         integrationId: data.integrationId,
      })
   }

   return {
      ...data,
      tokens: accountTokens,
   }
}

/**
 * Convert business models into plain objects (arrays)
 * @param result
 */
function serializeModels<T extends BaseModel>(result: T[]) {
   return result.map((entry) => entry.serializeToPlainObject())
}
