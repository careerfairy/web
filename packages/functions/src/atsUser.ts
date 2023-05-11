import functions = require("firebase-functions")
import {
   logAndThrow,
   validateData,
   validateUserAuthExists,
} from "./lib/validations"
import { object, string } from "yup"
import {
   atsRepo,
   groupRepo,
   livestreamsRepo,
   userRepo,
} from "./api/repositories"
import { logAxiosError, onCallWrapper, serializeModels } from "./util"
import { Job, JobIdentifier } from "@careerfairy/shared-lib/ats/Job"
import {
   userAlreadyAppliedForJob,
   UserATSRelations,
} from "@careerfairy/shared-lib/users"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { getATSTokens } from "./lib/groups"
import { Application } from "@careerfairy/shared-lib/ats/Application"
import { userSetHasJobApplications } from "./lib/user"
import { createJobApplication } from "./lib/ats"
import config from "./config"

/*
|--------------------------------------------------------------------------
| ATS functions related to User operations
|--------------------------------------------------------------------------
*/

/**
 * Fetch Jobs associated with a livestream
 * Since livestreams are public, anyone can run this function (no sign in)
 *
 * Possible to fetch the jobs by a livestreamId or jobs (LivestreamJobAssociation[]) array
 */
export const fetchLivestreamJobs = functions
   .region(config.region)
   .runWith({ secrets: ["MERGE_ACCESS_KEY"] })
   .https.onCall(async (data) => {
      let jobAssociationList = []

      if (data.livestreamId) {
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

         jobAssociationList = livestream.jobs
      } else {
         jobAssociationList = data.jobs
      }

      if (!data.livestreamId && !data.jobs) {
         return logAndThrow("Invalid arguments", data)
      }

      // integrationId -> token
      const tokens = await getATSTokens(jobAssociationList)

      const jobs: Job[] = []

      for (const jobAssociation of jobAssociationList) {
         const atsRepository = atsRepo(
            process.env.MERGE_ACCESS_KEY,
            tokens[jobAssociation.integrationId]
         )

         try {
            const fetchedJob = await atsRepository.getJob(jobAssociation.jobId)
            jobs.push(fetchedJob)
         } catch (e) {
            // log the error but let the function proceed
            // we want to be optimistic and try to fetch the next jobs
            logAxiosError(e)
         }
      }

      return serializeModels(jobs)
   })

/**
 * Updates the user's job applications
 * sub-collection with the latest application and job data
 * User needs to be signed in to run this function
 */
export const updateUserJobApplications = functions
   .region(config.region)
   .runWith({ secrets: ["MERGE_ACCESS_KEY"] })
   .https.onCall(
      onCallWrapper(async (_, context) => {
         // user needs to be signed in
         const token = await validateUserAuthExists(context)
         const userApplications = await userRepo.getJobApplications(token.email)
         const userATSDocument = await userRepo.getUserATSData(token.email)

         const batchOperations: {
            application: Application
            jobApplicationDocId: string
         }[] = []
         const tokens = await getATSTokens(userApplications)

         for (const userApplication of userApplications) {
            const lastUpdatedTime = userApplication?.updatedAt
               ?.toDate()
               ?.getTime()
            const nowTime = new Date().getTime()
            const timeThreshold = 3600000 // 1 hour

            if (
               lastUpdatedTime + timeThreshold < nowTime || // check if application document hasn't been updated in the last hour
               !lastUpdatedTime // OR hasn't been updated yet
            ) {
               // get the application status from ATS
               const atsRepository = atsRepo(
                  process.env.MERGE_ACCESS_KEY,
                  tokens[userApplication.integrationId]
               )
               const atsRelation =
                  userATSDocument.atsRelations[userApplication.integrationId]
               const applicationId =
                  atsRelation.jobApplications[userApplication.jobId]

               try {
                  const application = await atsRepository.getApplication(
                     applicationId
                  )
                  if (!application) {
                     // If application not found, do we delete the application document?
                     continue
                  }
                  batchOperations.push({
                     application,
                     jobApplicationDocId: userApplication.id,
                  })
               } catch (e) {
                  // log the error but let the function proceed
                  // we want to be optimistic and try to batch update the next applications
                  logAxiosError(e)
               }
            }
         }
         if (batchOperations.length) {
            try {
               await userRepo.batchUpdateUserJobApplications(
                  token.email,
                  batchOperations
               )
            } catch (e) {
               functions.logger.error(
                  "Error batch updating user job applications",
                  e,
                  batchOperations
               )
            }
         }
      })
   )

/**
 * Apply a user to a job
 * User needs to be signed in
 *
 * It will create the necessary entities on the Merge (Candidate, Application, etc.)
 */
export const atsUserApplyToJob = functions
   .region(config.region)
   .runWith({
      secrets: ["MERGE_ACCESS_KEY"],
   })
   .https.onCall(
      onCallWrapper(async (data, context) => {
         // user needs to be signed in
         await validateUserAuthExists(context)

         await validateData(
            data,
            object({
               livestreamId: string().required(),
               jobId: string().required(),
            })
         )

         const { livestreamId, jobId } = data
         const userEmail = context.auth.token.email

         const [livestream, userATSData, userData] = await Promise.all([
            livestreamsRepo.getById(livestreamId),
            userRepo.getUserATSData(userEmail),
            userRepo.getUserDataById(userEmail),
         ])
         const jobAssociation = livestream.jobs.find((a) => a.jobId === jobId)
         const integrationId = jobAssociation.integrationId

         const atsAccount = await groupRepo.getATSIntegration(
            jobAssociation.groupId,
            integrationId
         )

         // Confirm if the user has already applied to this job
         if (userATSData && userAlreadyAppliedForJob(userATSData, jobId)) {
            return { error: "User has already applied for that job" }
         }

         // Create the necessary ATS models to apply the user to the job
         const tokens = await getATSTokens([jobAssociation])

         const atsRepository = atsRepo(
            process.env.MERGE_ACCESS_KEY,
            tokens[jobAssociation.integrationId]
         )

         const job: Job = await atsRepository.getJob(jobId)

         if (!job) {
            return logAndThrow("That job does not exit", jobId)
         }

         const atsRelations = userATSData?.atsRelations?.[integrationId]

         let associationsToSave: Partial<UserATSRelations> = {
            // set the candidateId to avoid creating a new candidate
            candidateId: atsRelations?.candidateId ?? null,
         }

         try {
            associationsToSave = await createJobApplication(
               job,
               userData,
               atsRepository,
               atsAccount,
               associationsToSave
            )
         } catch (e) {
            // save the existing associations until the error
            // so that we don't need to recreate the objects on the next try
            // e.g. we have an error when creating the CV attachment, but the candidate object was created
            // on the next retry, we skip the candidate creation
            await userRepo.associateATSData(
               userEmail,
               integrationId,
               associationsToSave
            )

            throw e
         }

         const applicationId = associationsToSave.jobApplications[jobId]

         const jobIdentifier: JobIdentifier = {
            jobId: job.id,
            integrationId,
            groupId: jobAssociation.groupId,
         }

         // Save related data
         await Promise.allSettled([
            // Save the Merge Object IDs associations
            userRepo.associateATSData(
               userEmail,
               integrationId,
               associationsToSave
            ),
            // Update the UserLivestreamData document with the job application details
            // will be used for analytics
            livestreamsRepo.saveJobApplication(
               livestream.id,
               userEmail,
               jobIdentifier,
               job,
               applicationId
            ),
            // Create a job application document on user side
            userRepo.upsertJobApplication(
               userEmail,
               jobIdentifier,
               job,
               livestream
            ),
            // update user flag to display the jobs tab
            // this should be removed in the future when the feature is fully rolled out
            userSetHasJobApplications(userEmail),
         ])

         return applicationId
      })
   )
