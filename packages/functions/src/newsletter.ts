import { RuntimeOptions } from "firebase-functions"
import functions = require("firebase-functions")
import { DateTime } from "luxon"
import { PostmarkEmailSender } from "./api/postmark"
import { groupRepo, userRepo, livestreamsRepo } from "./api/repositories"
import config from "./config"
import { NewsletterEmailBuilder } from "./lib/NewsletterEmailBuilder"
import { NewsletterService } from "./lib/NewsletterService"
import { NewsletterDataFetcher } from "./lib/recommendation/services/DataFetcherRecommendations"
import { SparkReleaseEmailBuilder } from "./lib/SparkReleaseEmailBuilder"
import { SparkReleaseEmailService } from "./lib/SparkNewsletterService"

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
      const shouldSend = await shouldSendNewsletter()
      if (!shouldSend) {
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

export const manualSparkReleaseEmail = functions
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
         await sendSparkReleaseEmail()
         res.status(200).send("Spark Release email sent to everyone")
      } else {
         await sendSparkReleaseEmail(receivedEmails)
         res.status(200).send(
            "Spark Release email sent to " + receivedEmails.join(", ")
         )
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

async function sendSparkReleaseEmail(overrideUsers?: string[]) {
   if (newsletterAlreadySent) {
      functions.logger.info(
         "Spark release email was already sent in this execution environment, skipping"
      )
      return
   }

   const emailBuilder = new SparkReleaseEmailBuilder(
      PostmarkEmailSender.create()
   )

   const newsletterService = new SparkReleaseEmailService(
      userRepo,
      emailBuilder,
      functions.logger
   )

   await newsletterService.fetchRequiredData()

   await newsletterService.send(overrideUsers)

   if (!overrideUsers) {
      // set this flag when sending the newsletter to everyone
      newsletterAlreadySent = true
   }

   functions.logger.info("Newsletter sent")
}

/**
 * We only want to send the newsletter every other week and if the number of livestreams within the next month is > 8
 *
 * The cron job syntax has a limitation and we can't specify every other week
 * on the function level. So we have to do it here.
 *
 * By checking the week number, we have an issue during the last week of
 * the year and first week of the next year. This can run two weeks in a row
 * or once in three weeks. But for now, this is not a big deal.
 *
 */
async function shouldSendNewsletter() {
   const now = DateTime.now()
   const weekNumber = now.weekNumber
   const numberOfLivestreams = 8
   const numberOfDays = 30

   // Now we call our updated function with dynamic parameters.
   // Here we are still checking for more than 8 livestreams in the next 30 days.
   const hasMoreThanEightLivestreamsInNext30Days =
      await livestreamsRepo.hasMoreThanNLivestreamsInNextNDays(
         numberOfLivestreams,
         numberOfDays
      )

   functions.logger.info(
      `Has more than ${numberOfLivestreams} livestreams in next ${numberOfDays} days:`,
      hasMoreThanEightLivestreamsInNext30Days
   )
   functions.logger.info("Week number", weekNumber)

   return weekNumber % 2 === 0 && hasMoreThanEightLivestreamsInNext30Days
}
