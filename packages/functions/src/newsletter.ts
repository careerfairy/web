import { logger } from "firebase-functions/v2"
import { onRequest } from "firebase-functions/v2/https"
import { onSchedule } from "firebase-functions/v2/scheduler"
import { DateTime } from "luxon"
import { PostmarkEmailSender } from "./api/postmark"
import {
   emailNotificationsRepo,
   groupRepo,
   livestreamsRepo,
   sparkRepo,
   userRepo,
} from "./api/repositories"
import { ManualTemplatedEmailBuilder } from "./lib/ManualTemplatedEmailBuilder"
import { ManualTemplatedEmailService } from "./lib/ManualTemplatedEmailService"
import { NewsletterEmailBuilder } from "./lib/newsletter/NewsletterEmailBuilder"
import { NewsletterService } from "./lib/newsletter/services/NewsletterService"
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
const runtimeSettings = {
   // may take a while
   timeoutSeconds: 60 * 9,
   // we may load lots of data into memory
   memory: "8GiB",
} as const

/**
 * Send a newsletter to all users every other tuesday
 * The function runs every tuesday and only inside of it is it specified to run
 * every other tuesday
 */
export const newsletter = onSchedule(
   {
      schedule: "0 18 * * Tue",
      timeZone: "Europe/Zurich",
      ...runtimeSettings,
   },
   async () => {
      const shouldSend = await shouldSendNewsletter()
      if (!shouldSend) {
         logger.info("Newsletter not sent, reason: Only send every other week")
         return
      }

      await sendNewsletter()
   }
)

/**
 * Send the newsletter manually to everyone or to a list of emails
 */
export const manualNewsletter = onRequest(runtimeSettings, async (req, res) => {
   if (req.method !== "GET") {
      res.status(400).send("Only GET requests are allowed")
      return
   }

   const receivedEmails = ((req.query.emails as string) ?? "")
      .split(",")
      .map((email) => email?.trim())
      .filter(Boolean)

   logger.info("Received emails", receivedEmails)

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

export const manualTemplatedEmail = onRequest(
   runtimeSettings,
   async (req, res) => {
      logger.info("manualTemplatedEmail: v9.0 - fill and win")

      if (req.method !== "GET") {
         res.status(400).send("Only GET requests are allowed")
         return
      }

      const receivedEmails = ((req.query.emails as string) ?? "")
         .split(",")
         .map((email) => email?.trim())
         .filter(Boolean)

      logger.info("Received emails", receivedEmails)

      if (receivedEmails.length === 0) {
         res.status(400).send("No emails provided")
         return
      }

      if (receivedEmails.length === 1 && receivedEmails[0] === "everyone") {
         await sendManualTemplatedEmail()
         res.status(200).send("Fill and win email sent to everyone")
      } else {
         await sendManualTemplatedEmail(receivedEmails)
         res.status(200).send(
            "Fill and win email sent to " + receivedEmails.join(", ")
         )
      }
   }
)

async function sendNewsletter(overrideUsers?: string[]) {
   if (newsletterAlreadySent) {
      logger.info(
         "Newsletter was already sent in this execution environment, skipping"
      )
      return
   }

   const dataLoader = await NewsletterDataFetcher.create()
   const emailBuilder = new NewsletterEmailBuilder(PostmarkEmailSender.create())
   const newsletterService = new NewsletterService(
      userRepo,
      groupRepo,
      emailNotificationsRepo,
      dataLoader,
      emailBuilder,
      logger
   )

   logger.info("Fetching required data...")
   await newsletterService.fetchRequiredData()

   logger.info("Fetching recommendation data...")
   await newsletterService.generateRecommendations()

   logger.info("Fetching populated users...")
   await newsletterService.populateUsers()

   logger.info("Sending newsletter...")
   await newsletterService.send(overrideUsers)

   if (!overrideUsers) {
      // set this flag when sending the newsletter to everyone
      newsletterAlreadySent = true
   }

   logger.info("Newsletter sent")
}

async function sendManualTemplatedEmail(overrideUsers?: string[]) {
   if (newsletterAlreadySent) {
      logger.info("Fill and win email already sent, skipping")
      return
   }

   const emailBuilder = new ManualTemplatedEmailBuilder(
      PostmarkEmailSender.create(),
      logger
   )

   const newsletterService = new ManualTemplatedEmailService(
      userRepo,
      sparkRepo,
      emailBuilder,
      logger
   )

   await newsletterService.fetchRequiredData(overrideUsers)

   await newsletterService.send()

   if (!overrideUsers) {
      // set this flag when sending the newsletter to everyone
      newsletterAlreadySent = true
   }

   logger.info("Fill and win execution done")
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

   logger.info(
      `Has more than ${numberOfLivestreams} livestreams in next ${numberOfDays} days:`,
      hasMoreThanEightLivestreamsInNext30Days
   )
   logger.info("Week number", weekNumber)

   return weekNumber % 2 === 0 && hasMoreThanEightLivestreamsInNext30Days
}
