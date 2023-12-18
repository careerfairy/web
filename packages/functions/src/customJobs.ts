import functions = require("firebase-functions")
import config from "./config"
import { onCallWrapper } from "./util"
import { middlewares } from "./middlewares/middlewares"
import { dataValidation, userAuthExists } from "./middlewares/validations"
import { string } from "yup"
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
                  userRepo.getCustomJobApplication(userId, jobId),
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
            return Promise.allSettled([
               userRepo.applyUserToCustomJob(userId, jobToApply),
               customJobRepo.applyUserToCustomJob(
                  user,
                  jobToApply,
                  livestreamId
               ),
            ])
         })
      )
   )
