import functions = require("firebase-functions")
import config from "./config"
import { onCallWrapper } from "./util"
import { middlewares } from "./middlewares/middlewares"
import {
   dataValidation,
   userAuthExists,
   userShouldBeGroupAdmin,
} from "./middlewares/validations"
import { string, array } from "yup"
import { userRepo, customJobRepo } from "./api/repositories"

export const userApplyToCustomJob = functions
   .region(config.region)
   .runWith({
      secrets: ["MERGE_ACCESS_KEY"],
   })
   .https.onCall(
      middlewares(
         dataValidation({
            livestreamId: string(),
            userId: string().required(),
            jobId: string().required(),
         }),
         userAuthExists(),
         onCallWrapper(async (data) => {
            const { livestreamId, userId, jobId } = data
            functions.logger.log(
               `Starting custom job ${jobId} apply process for the user ${userId} on the livestream ${livestreamId}`
            )

            // Get custom job data and verify if the user already has any information related to the job application.
            // If such information exists, it indicates that the user has previously applied to this specific job, and no further action is needed.
            const [jobToApply, userCustomJobApplication, user] =
               await Promise.all([
                  customJobRepo.getCustomJobById(jobId),
                  customJobRepo.getUserJobApplication(userId, jobId),
                  userRepo.getUserDataById(userId),
               ])

            if (userCustomJobApplication) {
               functions.logger.log(
                  `User ${userId} have already applied to the job ${jobId}`
               )
               return null
            }

            // create job application
            // Add job application details on the user document
            return customJobRepo.applyUserToCustomJob(
               user,
               jobToApply,
               livestreamId
            )
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
