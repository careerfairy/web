import functions = require("firebase-functions")
import { DateTime } from "luxon"
import { PostmarkEmailSender } from "./api/postmark"
import { groupRepo, userRepo } from "./api/repositories"
import config from "./config"
import { NewsletterEmailBuilder } from "./lib/NewsletterEmailBuilder"
import { NewsletterService } from "./lib/NewsletterService"
import { NewsletterDataFetcher } from "./lib/recommendation/services/DataFetcherRecommendations"

export const newsletter = functions
   .region(config.region)
   .runWith({
      // may take a while
      timeoutSeconds: 60 * 9,
      // we may load lots of data into memory
      memory: "512MB",
   })
   .pubsub.schedule("0 18 * * Tue") // every tuesday at 6pm
   .timeZone("Europe/Zurich")
   .onRun(async () => {
      if (!shouldSendNewsletter()) {
         functions.logger.info("Newsletter not sent")
         return
      }

      const dataLoader = await NewsletterDataFetcher.create()
      const emailBuilder = new NewsletterEmailBuilder(
         PostmarkEmailSender.create()
      )
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

      await newsletterService.send()

      functions.logger.info("Newsletter sent")
   })

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
