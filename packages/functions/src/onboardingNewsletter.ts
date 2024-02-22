import { RuntimeOptions } from "firebase-functions"
import functions = require("firebase-functions")
import { PostmarkEmailSender } from "./api/postmark"
import {
   userRepo,
   livestreamsRepo,
   sparkRepo,
   notificationsRepo,
} from "./api/repositories"
import config from "./config"
import { OnboardingNewsletterEmailBuilder } from "./lib/newsletter/onboarding/OnboardingNewsletterEmailBuilder"
import { OnboardingNewsletterService } from "./lib/newsletter/services/OnboardingNewsletterService"
import { NewsletterDataFetcher } from "./lib/recommendation/services/DataFetcherRecommendations"

/**
 * To be sure we only send 1 newsletter when manually triggered
 *
 * It's easy to make multiple browser requests and thus send multiple newsletters
 * which is bad, the user will probably unsubscribe after receiving 2 or more
 * newsletters in a short time
 *
 *
 * This variable works as a safeguard to make we only send one newsletter
 * This should be clear when Google Cloud removes the function execution environment
 * after a while
 *
 * https://cloud.google.com/functions/docs/bestpractices/tips#use_global_variables_to_reuse_objects_in_future_invocations
 */
const newsletterAlreadySent = false

/**
 * OnboardingNewsletter functions runtime settings
 */
const runtimeSettings: RuntimeOptions = {
   // may take a while
   timeoutSeconds: 60 * 9,
   // we may load lots of data into memory
   memory: "2GB",
}

/**
 * Check and send onboarding newsletter everyday at a specific time
 */
export const onboardingNewsletter = functions
   .region(config.region)
   .runWith(runtimeSettings)
   .pubsub.schedule("0 17 * * *") // everyday at 9am
   .timeZone("Europe/Zurich")
   .onRun(async () => {
      functions.logger.info("Starting execution of OnboardingNewsletterService")
      // Disable for now - wgoncalves
      // await sendOnboardingNewsletter()
   })

export const manualOnboardingNewsletter = functions
   .region(config.region)
   .https.onRequest(async (req, res) => {
      if (req.method !== "GET") {
         res.status(400).send("Only GET requests are allowed")
         return
      }

      functions.logger.info(
         "Starting MANUAL execution of OnboardingNewsletterService"
      )
      const receivedEmails = ((req.query.emails as string) ?? "")
         .split(",")
         .map((email) => email?.trim())
         .filter(Boolean)

      functions.logger.info("Received emails", receivedEmails)

      if (receivedEmails.length === 0) {
         res.status(400).send("No emails provided")
         return
      }

      if (receivedEmails.length === 1 && receivedEmails[0] === "everyone") {
         await sendOnboardingNewsletter()
         res.status(200).send("Onboarding Newsletter sent to everyone")
      } else {
         await sendOnboardingNewsletter(receivedEmails)
         res.status(200).send(
            "Onboarding Newsletter sent to " + receivedEmails.join(", ")
         )
      }
      functions.logger.info(
         "Ended MANUAL execution of OnboardingNewsletterService"
      )
   })

async function sendOnboardingNewsletter(overrideUsers?: string[]) {
   if (newsletterAlreadySent) {
      functions.logger.info(
         "OnboardingNewsletter was already sent in this execution environment, skipping"
      )
      return
   }

   const emailBuilder = new OnboardingNewsletterEmailBuilder(
      PostmarkEmailSender.create()
   )
   const dataLoader = await NewsletterDataFetcher.create()
   const onboardingNewsletterService = new OnboardingNewsletterService(
      userRepo,
      sparkRepo,
      notificationsRepo,
      livestreamsRepo,
      dataLoader,
      emailBuilder,
      overrideUsers,
      functions.logger
   )

   await onboardingNewsletterService.fetchRequiredData()

   onboardingNewsletterService.buildDiscoveryLists()

   await onboardingNewsletterService.sendDiscoveryEmails()

   functions.logger.info("OnboardingNewsletter(s) sent")
}
