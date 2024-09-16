import functions = require("firebase-functions")
import { SchemaOf, array, object, string } from "yup"
import { customJobRepo, groupRepo, userRepo } from "./api/repositories"
import config from "./config"
import { logAndThrow } from "./lib/validations"
import { middlewares } from "./middlewares/middlewares"
import {
   dataValidation,
   userAuthExists,
   userShouldBeGroupAdmin,
} from "./middlewares/validations"
import { onCallWrapper } from "./util"

type UserCustomJobApplication = {
   authId: string
   jobId: string
}

const UserCustomJobApplicationSchema: SchemaOf<UserCustomJobApplication> =
   object().shape({
      authId: string().required(),
      jobId: string().required(),
   })
type CustomJobsGroupNames = {
   [jobId: string]: {
      groupId: string
   }
}

// Validation schema
const CustomJobsGroupNamesSchema: SchemaOf<CustomJobsGroupNames> = object()
   .shape({})
   .noUnknown(true)
   .test(
      "dynamic-keys",
      "Each key must have an object with a valid groupId",
      (value) => {
         if (!value || typeof value !== "object") return false

         // Validate each key-value pair
         return Object.entries(value).every(([key, val]) => {
            // Ensure each value has the structure { groupId: string }
            return (
               typeof key === "string" &&
               typeof val === "object" &&
               val !== null &&
               "groupId" in val &&
               typeof val["groupId"] === "string"
            )
         })
      }
   )
   .defined()

export const confirmUserApplyToCustomJob = functions
   .region(config.region)
   .runWith({
      secrets: ["MERGE_ACCESS_KEY"],
   })
   .https.onCall(
      middlewares(
         dataValidation(UserCustomJobApplicationSchema),
         userAuthExists(),
         onCallWrapper(async (data: UserCustomJobApplication) => {
            const { authId: userId, jobId } = data
            functions.logger.log(
               `Starting custom job ${jobId} apply confirmation process for the user ${userId}`
            )

            // Get custom job data and verify if the user already has any information related to the job application.
            // If such information exists, it indicates that the user has previously applied to this specific job, and no further action is needed.
            const [jobToApply, userCustomJobApplication, user] =
               await Promise.all([
                  customJobRepo.getCustomJobById(jobId),
                  customJobRepo.getUserJobApplication(userId, jobId),
                  userRepo.getUserDataById(userId),
               ])

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
         })
      )
   )

export const confirmAnonApplyToCustomJob = functions
   .region(config.region)
   .runWith({
      secrets: ["MERGE_ACCESS_KEY"],
   })
   .https.onCall(
      middlewares(
         dataValidation(UserCustomJobApplicationSchema),
         onCallWrapper(async (data: UserCustomJobApplication) => {
            const { authId: fingerPrintId, jobId } = data
            functions.logger.log(
               `Starting custom job ${jobId} apply confirmation process for the anonymous user with finger print ${fingerPrintId}`
            )

            // Get custom job data and verify if the user already has any information related to the job application.
            // If such information exists, it indicates that the user has previously applied to this specific job, and no further action is needed.
            const [jobToApply, anonUserCustomJobApplication] =
               await Promise.all([
                  customJobRepo.getCustomJobById(jobId),
                  customJobRepo.getAnonymousJobApplication(
                     fingerPrintId,
                     jobId
                  ),
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
         })
      )
   )

export const getCustomJobGroupNames = functions
   .region(config.region)
   .https.onCall(
      middlewares(
         dataValidation(CustomJobsGroupNamesSchema),
         onCallWrapper(async (data: CustomJobsGroupNames) => {
            const jobIds = Object.keys(data)

            functions.logger.log(
               `Starting get custom job group names for jobs: ${jobIds}`
            )

            const promises = jobIds.map(async (jobId) => {
               return groupRepo
                  .getGroupById(data[jobId].groupId)
                  .then((group) => {
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
         })
      )
   )
export const setAnonymousJobApplicationsUserId = functions
   .region(config.region)
   .https.onCall(
      middlewares(
         dataValidation({
            fingerPrintId: string().required(),
            userId: string().required(),
         }),
         onCallWrapper(async (data) => {
            const { userId, fingerPrintId } = data

            const [, userData] = await Promise.all([
               userRepo.updateUserAnonymousJobApplications(
                  userId,
                  fingerPrintId
               ),
               userRepo.getUserDataById(userId),
            ])
            await userRepo.migrateAnonymousJobApplications(userData)
         })
      )
   )

export const updateCustomJobWithLinkedLivestreams = functions
   .region(config.region)
   .runWith({
      secrets: ["MERGE_ACCESS_KEY"],
   })
   .https.onCall(
      middlewares(
         dataValidation({
            livestreamId: string().required(),
            jobIds: array().of(string()),
         }),
         onCallWrapper(async (data) => {
            const { livestreamId, jobIds } = data

            functions.logger.log(
               `Sync custom jobs linked by livestream ${livestreamId}`
            )
            const currentLinkedCustomJobs =
               await customJobRepo.getCustomJobsByLivestreamId(livestreamId)

            // convert array to object for faster lookups
            const outdatedJobsMap = currentLinkedCustomJobs.reduce(
               (acc, job) => {
                  acc[job.id] = job
                  return acc
               },
               {}
            )

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
         })
      )
   )

export const transferCustomJobsFromDraftToPublishedLivestream = functions
   .region(config.region)
   .runWith({
      secrets: ["MERGE_ACCESS_KEY"],
   })
   .https.onCall(
      middlewares(
         dataValidation({
            draftId: string().required(),
            livestreamId: string().required(),
            groupId: string().required(),
         }),
         userShouldBeGroupAdmin(),
         onCallWrapper(async (data) => {
            const { draftId, livestreamId } = data

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
         })
      )
   )

/**
 * Every day at 6 AM, check
 * all the custom jobs that expired and updates the published flag if needed
 * all the custom jobs that are expired for more than 30 day should be permanently expired
 */
export const syncPermanentlyExpiredCustomJobs = functions
   .region(config.region)
   .pubsub.schedule("0 6 * * *") // everyday at 6am
   .timeZone("Europe/Zurich")
   .onRun(async () => {
      functions.logger.info(
         "Starting execution of syncPermanentlyExpiredCustomJobs"
      )

      try {
         const promises = [
            customJobRepo.syncPermanentlyExpiredCustomJobs(),
            customJobRepo.syncExpiredCustomJobs(),
         ]

         return Promise.all(promises)
      } catch (e) {
         logAndThrow(e)
      }
   })
