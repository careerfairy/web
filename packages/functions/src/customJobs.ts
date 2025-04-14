import functions = require("firebase-functions")
import { Group } from "@careerfairy/shared-lib/groups"
import { onCall } from "firebase-functions/https"
import { onSchedule } from "firebase-functions/scheduler"
import { SchemaOf, array, object, string } from "yup"
import { customJobRepo, groupRepo, userRepo } from "./api/repositories"
import { logAndThrow } from "./lib/validations"
import { middlewares } from "./middlewares/middlewares"
import {
   dataValidation,
   userAuthExists,
   userShouldBeGroupAdmin,
} from "./middlewares/validations"

type UserCustomJobApplication = {
   authId: string
   jobId: string
}

const UserCustomJobApplicationSchema: SchemaOf<UserCustomJobApplication> =
   object().shape({
      authId: string().required(),
      jobId: string().required(),
   })
type CustomJobsGroupNames = Record<string, string>

// Validation schema
const CustomJobsGroupNamesSchema: SchemaOf<CustomJobsGroupNames> = object()
   .shape({})
   .test("is-valid-record", "All values must be strings", (value) => {
      if (typeof value !== "object" || value === null) {
         return false
      }

      // Validate all values in the object are strings
      return Object.values(value).every((v) => typeof v === "string")
   })
   .defined()

type SetRemoveUserCustomJobApplicationData = {
   userId: string
   jobId: string
}

const SetRemoveUserCustomJobApplicationDataSchema: SchemaOf<SetRemoveUserCustomJobApplicationData> =
   object().shape({
      userId: string().required(),
      jobId: string().required(),
   })

export const confirmUserApplyToCustomJob = onCall(
   {
      secrets: ["MERGE_ACCESS_KEY"],
   },
   middlewares<UserCustomJobApplication>(
      dataValidation(UserCustomJobApplicationSchema),
      userAuthExists(),
      async (request) => {
         const { authId: userId, jobId } = request.data
         functions.logger.log(
            `Starting custom job ${jobId} apply confirmation process for the user ${userId}`
         )

         // Get custom job data and verify if the user already has any information related to the job application.
         // If such information exists, it indicates that the user has previously applied to this specific job, and no further action is needed.
         const [jobToApply, userCustomJobApplication, user] = await Promise.all(
            [
               customJobRepo.getCustomJobById(jobId),
               customJobRepo.getUserJobApplication(userId, jobId),
               userRepo.getUserDataById(userId),
            ]
         )

         if (!userCustomJobApplication) {
            functions.logger.log(
               `User ${userId} has not initiated job application for job with ID: ${jobId}`
            )
            return null
         }

         // create job application
         // Add job application details on the user document
         return customJobRepo.confirmUserApplicationToCustomJob(
            user,
            jobToApply.id
         )
      }
   )
)

export const confirmAnonApplyToCustomJob = onCall(
   {
      secrets: ["MERGE_ACCESS_KEY"],
   },
   middlewares<UserCustomJobApplication>(
      dataValidation(UserCustomJobApplicationSchema),
      async (request) => {
         const { authId: fingerPrintId, jobId } = request.data
         functions.logger.log(
            `Starting custom job ${jobId} apply confirmation process for the anonymous user with finger print ${fingerPrintId}`
         )

         // Get custom job data and verify if the user already has any information related to the job application.
         // If such information exists, it indicates that the user has previously applied to this specific job, and no further action is needed.
         const [jobToApply, anonUserCustomJobApplication] = await Promise.all([
            customJobRepo.getCustomJobById(jobId),
            customJobRepo.getAnonymousJobApplication(fingerPrintId, jobId),
         ])

         if (!anonUserCustomJobApplication) {
            functions.logger.log(
               `Anonymous user with finger print ${fingerPrintId} has not initiated job application for job with ID: ${jobId}`
            )
            return null
         }

         return customJobRepo.confirmAnonymousUserApplicationToCustomJob(
            fingerPrintId,
            jobToApply.id
         )
      }
   )
)

export const getCustomJobGroupNames = onCall(
   middlewares<CustomJobsGroupNames>(
      dataValidation(CustomJobsGroupNamesSchema),
      async (request) => {
         const jobIds = Object.keys(request.data)

         functions.logger.log(
            `Starting get custom job group names for jobs: ${jobIds}`
         )

         const promises = jobIds.map(async (jobId) => {
            return groupRepo.getGroupById(request.data[jobId]).then((group) => {
               return {
                  [jobId]: group.universityName,
               }
            })
         })

         const jobsGroupNamesMap = await Promise.all(promises)

         // Convert the array of objects to a single dynamic object
         return jobsGroupNamesMap.reduce((acc, curr) => {
            return { ...acc, ...curr } // Merge the current object into the accumulator
         }, {})
      }
   )
)

export const setAnonymousJobApplicationsUserId = onCall(
   {
      secrets: ["MERGE_ACCESS_KEY"],
   },
   middlewares<{
      fingerPrintId: string
      userId: string
   }>(
      dataValidation({
         fingerPrintId: string().required(),
         userId: string().required(),
      }),
      async (request) => {
         const { userId, fingerPrintId } = request.data

         const [, userData] = await Promise.all([
            userRepo.updateUserAnonymousJobApplications(userId, fingerPrintId),
            userRepo.getUserDataById(userId),
         ])
         await userRepo.migrateAnonymousJobApplications(userData)
      }
   )
)

export const updateCustomJobWithLinkedLivestreams = onCall(
   {
      secrets: ["MERGE_ACCESS_KEY"],
   },
   middlewares<{
      livestreamId: string
      jobIds: string[]
   }>(
      dataValidation({
         livestreamId: string().required(),
         jobIds: array().of(string()),
      }),
      async (request) => {
         const { livestreamId, jobIds } = request.data

         functions.logger.log(
            `Sync custom jobs linked by livestream ${livestreamId}`
         )
         const currentLinkedCustomJobs =
            await customJobRepo.getCustomJobsByLivestreamId(livestreamId)

         // convert array to object for faster lookups
         const outdatedJobsMap = currentLinkedCustomJobs.reduce((acc, job) => {
            acc[job.id] = job
            return acc
         }, {})

         // These are the job ids that were added to this livestream
         const jobIdsToAdd = jobIds.filter(
            (jobId: string) => !outdatedJobsMap[jobId]
         )

         // These are the job ids that were removed to this livestream
         const jobIdsToRemove = Object.keys(outdatedJobsMap).filter(
            (jobId) => !jobIds.includes(jobId)
         )

         const promises = []

         if (jobIdsToAdd.length > 0) {
            promises.push(
               customJobRepo.updateCustomJobWithLinkedLivestreams(
                  livestreamId,
                  jobIdsToAdd
               )
            )
         }

         if (jobIdsToRemove.length > 0) {
            promises.push(
               customJobRepo.updateCustomJobWithLinkedLivestreams(
                  livestreamId,
                  jobIdsToRemove,
                  true
               )
            )
         }

         return Promise.all(promises)
      }
   )
)

export const transferCustomJobsFromDraftToPublishedLivestream = onCall(
   {
      secrets: ["MERGE_ACCESS_KEY"],
   },
   middlewares<{
      draftId: string
      livestreamId: string
      groupId: string
      group: Group
   }>(
      dataValidation({
         draftId: string().required(),
         livestreamId: string().required(),
         groupId: string().required(),
      }),
      userShouldBeGroupAdmin(),
      async (request) => {
         const { draftId, livestreamId } = request.data

         functions.logger.log(
            `Transfer custom jobs from draft ${draftId} to published livestream ${livestreamId}`
         )

         const draftCustomJobs =
            await customJobRepo.getCustomJobsByLivestreamId(draftId)
         const draftCustomJobsIds = draftCustomJobs.map((job) => job.id)

         return customJobRepo.updateCustomJobWithLinkedLivestreams(
            livestreamId,
            draftCustomJobsIds
         )
      }
   )
)

/**
 * Every day at 6 AM, check
 * all the custom jobs that expired and updates the published flag if needed
 * all the custom jobs that are expired for more than 30 day should be permanently expired
 */
export const syncPermanentlyExpiredCustomJobs = onSchedule(
   {
      schedule: "0 6 * * *", // everyday at 6am
      timeZone: "Europe/Zurich",
   },
   async () => {
      functions.logger.info(
         "Starting execution of syncPermanentlyExpiredCustomJobs"
      )

      try {
         const promises = [
            customJobRepo.syncPermanentlyExpiredCustomJobs(),
            customJobRepo.syncExpiredCustomJobs(),
         ]

         await Promise.all(promises)
      } catch (e) {
         logAndThrow(e)
      }
   }
)

export const setRemoveUserJobApplication = onCall(
   middlewares<SetRemoveUserCustomJobApplicationData>(
      dataValidation(SetRemoveUserCustomJobApplicationDataSchema),
      async (request) => {
         const { userId, jobId } = request.data

         await customJobRepo.setRemovedUserCustomJobApplication(userId, jobId)
      }
   )
)
