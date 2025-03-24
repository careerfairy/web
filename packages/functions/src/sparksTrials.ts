import { RuntimeOptions } from "firebase-functions"
import {
   emailNotificationsRepo,
   groupRepo,
   notificationService,
} from "./api/repositories"
import config from "./config"
import { TrialService } from "./lib/trials/services/TrialService"
import { SparkTrialEndEmailBuilder } from "./lib/trials/sparks/SparksTrialEndEmailBuilder"
import functions = require("firebase-functions")

/**
 * Sparks Trial End Emails functions runtime settings
 */
const runtimeSettings: RuntimeOptions = {
   // may take a while
   timeoutSeconds: 60 * 2,
   memory: "256MB",
}

/**
 * Check and send end of trial everyday at a specific time
 */
export const endOfSparksTrialEmails = functions
   .region(config.region)
   .runWith(runtimeSettings)
   .pubsub.schedule("0 10 * * *") // everyday at 10pm
   .timeZone("Europe/Zurich")
   .onRun(async () => {
      functions.logger.info("Starting execution of endOfSparksTrialEmails v2")

      await sendEndOfSparksTrialEmails()
   })

export const manualEndOfSparksTrialEmails = functions
   .region(config.region)
   .runWith(runtimeSettings)
   .https.onRequest(async (req, res) => {
      functions.logger.info(
         "Starting MANUAL execution of endOfSparksTrialEmails v2"
      )

      if (req.method !== "POST") {
         res.status(400).send("Only POST requests are allowed")
         return
      }

      await sendEndOfSparksTrialEmails()
      res.status(200).send(
         "endOfSparksTrialEmails sent to every company with expiring trial"
      )
   })

async function sendEndOfSparksTrialEmails() {
   const emailBuilder = new SparkTrialEndEmailBuilder(
      notificationService,
      functions.logger
   )
   const trialService = new TrialService(
      groupRepo,
      emailNotificationsRepo,
      emailBuilder,
      functions.logger
   )

   await trialService.fetchData()

   await trialService.buildNotifications()
   await trialService.createNotifications()

   await emailBuilder.send()
}
