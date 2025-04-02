import { GlobalOptions, logger } from "firebase-functions/v2"
import { onRequest } from "firebase-functions/v2/https"
import { onSchedule } from "firebase-functions/v2/scheduler"
import {
   emailNotificationsRepo,
   groupRepo,
   notificationService,
} from "./api/repositories"
import { TrialService } from "./lib/trials/services/TrialService"
import { SparkTrialEndEmailBuilder } from "./lib/trials/sparks/SparksTrialEndEmailBuilder"

/**
 * Sparks Trial End Emails functions runtime settings
 */
const runtimeSettings: GlobalOptions = {
   // may take a while
   timeoutSeconds: 60 * 2,
   memory: "256MiB",
}

/**
 * Check and send end of trial everyday at a specific time
 */
export const endOfSparksTrialEmails = onSchedule(
   {
      schedule: "0 10 * * *", // everyday at 10pm
      timeZone: "Europe/Zurich",
      ...runtimeSettings,
   },
   async () => {
      logger.info("Starting execution of endOfSparksTrialEmails v2")

      await sendEndOfSparksTrialEmails()
   }
)

export const manualEndOfSparksTrialEmails = onRequest(
   runtimeSettings,
   async (req, res) => {
      logger.info("Starting MANUAL execution of endOfSparksTrialEmails v2")

      if (req.method !== "POST") {
         res.status(400).send("Only POST requests are allowed")
         return
      }

      await sendEndOfSparksTrialEmails()
      res.status(200).send(
         "endOfSparksTrialEmails sent to every company with expiring trial"
      )
   }
)

async function sendEndOfSparksTrialEmails() {
   const emailBuilder = new SparkTrialEndEmailBuilder(
      notificationService,
      logger
   )
   const trialService = new TrialService(
      groupRepo,
      emailNotificationsRepo,
      emailBuilder,
      logger
   )

   await trialService.fetchData()

   await trialService.buildNotifications()
   await trialService.createNotifications()

   await emailBuilder.send()
}
