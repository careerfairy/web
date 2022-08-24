import functions = require("firebase-functions")
import {
   logAndThrow,
   validateData,
   validateUserAuthExists,
} from "./lib/validations"
import { object, string } from "yup"
import { atsRepo, livestreamsRepo, userRepo } from "./api/repositories"
import { logAxiosError, onCallWrapper, serializeModels } from "./util"
import { Job } from "@careerfairy/shared-lib/dist/ats/Job"
import { Candidate } from "@careerfairy/shared-lib/dist/ats/Candidate"
import {
   userAlreadyAppliedForJob,
   UserATSDocument,
} from "@careerfairy/shared-lib/dist/users"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { getATSTokens } from "./lib/groups"
import { Application } from "@careerfairy/shared-lib/dist/ats/Application"

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
   .runWith({ secrets: ["MERGE_ACCESS_KEY"] })
   .https.onCall(async (data, context) => {
      // user needs to be signed in
      const token = await validateUserAuthExists(context)
      try {
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
               logAndThrow("Error batch updating user job applications", e)
               functions.logger.error(
                  "Error batch updating user job applications",
                  e,
                  batchOperations
               )
            }
         }
      } catch (e) {
         logAxiosError(e)
      }
   })

/**
 * Apply a user to a job
 * User needs to be signed in
 *
 * It will create the necessary entities on the Merge (Candidate, Application, etc)
 */
export const atsUserApplyToJob = functions
   .runWith({ secrets: ["MERGE_ACCESS_KEY"] })
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

         const livestream = await livestreamsRepo.getById(livestreamId)
         const jobAssociation = livestream.jobs.find((a) => a.jobId === jobId)
         const integrationId = jobAssociation.integrationId
         const tokens = await getATSTokens([jobAssociation])

         const atsRepository = atsRepo(
            process.env.MERGE_ACCESS_KEY,
            tokens[jobAssociation.integrationId]
         )

         // Confirm if the user has already applied to this job
         const userATSData: UserATSDocument = await userRepo.getUserATSData(
            userEmail
         )

         const atsRelations = userATSData?.atsRelations?.[integrationId]

         if (userATSData && userAlreadyAppliedForJob(userATSData, jobId)) {
            return { error: "User has already applied for that job" }
         }

         // Create the necessary ATS models to apply the user to the job

         const job: Job = await atsRepository.getJob(jobId)

         if (!job) {
            return logAndThrow("That job does not exit", jobId)
         }

         const userData = await userRepo.getUserDataById(userEmail)

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
            await userRepo.associateATSData(userEmail, integrationId, {
               candidateId: candidate.id,
            })
         }

         // Associate CV resume if existent (and not associated already)
         if (userData.userResume && !atsRelations?.cvAttachmentId) {
            let resumeUrl = userData.userResume

            // Merge doesn't accept localhost, replace with remote storage
            // merge will try to fetch the file and store in their systems
            // it might fail if the file not accessible
            if (resumeUrl.indexOf("http://localhost:9199") !== -1) {
               // use a remote test CV file
               resumeUrl =
                  "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/development%2Fsample.pdf?alt=media&token=37d5f709-29e4-44d9-8400-f35629de64b6"
            }

            const attachmentId = await atsRepository.candidateAddCVAttachment(
               candidate.id,
               resumeUrl
            )

            await userRepo.associateATSData(userEmail, integrationId, {
               cvAttachmentId: attachmentId,
            })
         }

         // Create the application
         const applicationId = await atsRepository.createApplication(
            candidate.id,
            jobId
         )

         await userRepo.associateATSData(userEmail, integrationId, {
            jobApplications: {
               [jobId]: applicationId,
            },
         })

         // Create a job application document on user side
         await userRepo.upsertJobApplication(
            userEmail,
            { jobId: job.id, integrationId, groupId: jobAssociation.groupId },
            job,
            livestream
         )

         return applicationId
      })
   )
