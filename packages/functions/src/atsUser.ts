import functions = require("firebase-functions")
import { logAndThrow, validateData } from "./lib/validations"
import { object, string } from "yup"
import { atsRepo, livestreamsRepo, userRepo } from "./api/repositories"
import { logAxiosError, onCallWrapper, serializeModels } from "./util"
import { Job } from "@careerfairy/shared-lib/dist/ats/Job"
import { Candidate } from "@careerfairy/shared-lib/dist/ats/Candidate"
import { UserATSDocument } from "@careerfairy/shared-lib/dist/users"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { getATSTokensForJobAssociations } from "./lib/groups"
import { atsRequestValidationWithAccountToken } from "./lib/ats"

/*
|--------------------------------------------------------------------------
| ATS functions related to User operations
|--------------------------------------------------------------------------
*/

/**
 * Fetch Jobs associated with a livestream
 * Since livestreams are public, anyone can run this function (no sign in)
 */
export const fetchLivestreamJobs = functions
   .runWith({ secrets: ["MERGE_ACCESS_KEY"] })
   .https.onCall(async (data, context) => {
      await validateData(data, object({ livestreamId: string().required() }))

      const livestream: LivestreamEvent = await livestreamsRepo.getById(
         data.livestreamId
      )

      if (!livestream) {
         return logAndThrow("Livestream not found", data)
      }

      if (livestream.jobs?.length === 0) {
         // no associated jobs
         return []
      }

      // integrationId -> token
      const tokens = await getATSTokensForJobAssociations(livestream.jobs)

      const jobs: Job[] = []

      for (const jobAssociation of livestream.jobs) {
         const atsRepository = atsRepo(
            process.env.MERGE_ACCESS_KEY,
            tokens[jobAssociation.integrationId]
         )

         try {
            const fetched = await atsRepository.getJobs()
            jobs.push(...fetched)
         } catch (e) {
            // log the error but let the function proceed
            // we want to be optimistic and try to fetch the next jobs
            logAxiosError(e)
         }
      }

      return serializeModels(jobs)
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
