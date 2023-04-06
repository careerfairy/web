import { RuntimeOptions } from "firebase-functions"
import functions = require("firebase-functions")
import { DateTime } from "luxon"
import { PostmarkEmailSender } from "./api/postmark"
import { groupRepo, userRepo } from "./api/repositories"
import config from "./config"
import { NewsletterEmailBuilder } from "./lib/NewsletterEmailBuilder"
import { NewsletterService } from "./lib/NewsletterService"
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
let newsletterAlreadySent = false

/**
 * Newsletter functions runtime settings
 */
const runtimeSettings: RuntimeOptions = {
   // may take a while
   timeoutSeconds: 60 * 9,
   // we may load lots of data into memory
   memory: "2GB",
}

/**
 * Send a newsletter to all users every other tuesday
 */
export const newsletter = functions
   .region(config.region)
   .runWith(runtimeSettings)
   .pubsub.schedule("0 18 * * Tue") // every tuesday at 6pm
   .timeZone("Europe/Zurich")
   .onRun(async () => {
      if (!shouldSendNewsletter()) {
         functions.logger.info("Newsletter not sent")
         return
      }

      await sendNewsletter()
   })

/**
 * Send the newsletter manually to everyone or to a list of emails
 */
export const manualNewsletter = functions
   .region(config.region)
   .runWith(runtimeSettings)
   .https.onRequest(async (req, res) => {
      if (req.method !== "GET") {
         res.status(400).send("Only GET requests are allowed")
         return
      }

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
         await sendNewsletter()
         res.status(200).send("Newsletter sent to everyone")
      } else {
         await sendNewsletter(receivedEmails)
         res.status(200).send("Newsletter sent to " + receivedEmails.join(", "))
      }
   })

async function sendNewsletter(overrideUsers?: string[]) {
   if (newsletterAlreadySent) {
      functions.logger.info(
         "Newsletter was already sent in this execution environment, skipping"
      )
      return
   }

   const dataLoader = await NewsletterDataFetcher.create()
   const emailBuilder = new NewsletterEmailBuilder(PostmarkEmailSender.create())
   const newsletterService = new NewsletterService(
      userRepo,
      groupRepo,
      dataLoader,
      emailBuilder,
      functions.logger
   )

   await newsletterService.fetchRequiredData()
   await newsletterService.generateRecommendations()
   await newsletterService.populateUsers()

   await newsletterService.send(overrideUsers)

   if (!overrideUsers) {
      // set this flag when sending the newsletter to everyone
      newsletterAlreadySent = true
   }

   functions.logger.info("Newsletter sent")
}

/**
 * We only want to send the newsletter every other week
 *
 * The cron job syntax has a limitation and we can't specify every other week
 * on the function level. So we have to do it here.
 *
 * By checking the week number, we have an issue during the last week of
 * the year and first week of the next year. This can run two weeks in a row
 * or once in three weeks. But for now, this is not a big deal.
 *
 */
function shouldSendNewsletter() {
   const now = DateTime.now()
   const weekNumber = now.weekNumber

   return weekNumber % 2 === 0
}
