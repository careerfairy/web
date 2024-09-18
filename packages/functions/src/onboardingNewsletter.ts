import { isWithinNormalizationLimit } from "@careerfairy/shared-lib/utils"
import { logger } from "firebase-functions"
import { onRequest } from "firebase-functions/v2/https"
import { onSchedule } from "firebase-functions/v2/scheduler"
import { PostmarkEmailSender } from "./api/postmark"
import {
   emailNotificationsRepo,
   livestreamsRepo,
   sparkRepo,
   userRepo,
} from "./api/repositories"
import { OnboardingNewsletterEmailBuilder } from "./lib/newsletter/onboarding/OnboardingNewsletterEmailBuilder"
import { OnboardingNewsletterService } from "./lib/newsletter/services/OnboardingNewsletterService"
import { NewsletterDataFetcher } from "./lib/recommendation/services/DataFetcherRecommendations"

/**
 * OnboardingNewsletter functions runtime settings
 */
const runtimeOptions = {
   // may take a while
   timeoutSeconds: 60 * 9,
   // we may load lots of data into memory
   memory: "16GiB",
} as const

const ITEMS_PER_BATCH = 250
/**
 * Check and send onboarding newsletter everyday at a specific time
 */
export const onboardingNewsletter = onSchedule(
   {
      schedule: "0 17 * * *", // everyday at 17:00
      timeZone: "Europe/Zurich",
      ...runtimeOptions,
   },
   async () => {
      logger.info("Starting execution of OnboardingNewsletterService")
      await sendOnboardingNewsletter()
   }
)

export const manualOnboardingNewsletter = onRequest(
   runtimeOptions,
   async (req, res) => {
      if (req.method !== "GET") {
         res.status(400).send("Only GET requests are allowed")
         return
      }

      logger.info("Starting MANUAL execution of OnboardingNewsletterService")
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
         await sendOnboardingNewsletter()
         res.status(200).send("Onboarding Newsletter sent to everyone")
      } else {
         await sendOnboardingNewsletter(receivedEmails)
         res.status(200).send(
            "Onboarding Newsletter sent to " + receivedEmails.join(", ")
         )
      }
      logger.info("Ended MANUAL execution of OnboardingNewsletterService")
   }
)

async function sendOnboardingNewsletter(overrideUsers?: string[]) {
   logger.info("sendOnboardingNewsletter ~ V3 ")
   const dataLoader = await NewsletterDataFetcher.create()
   let allSubscribedUsers = await userRepo.getSubscribedUsersEarlierThan(
      overrideUsers,
      46
   )

   if (overrideUsers?.length) {
      const withinLimit = isWithinNormalizationLimit(30, overrideUsers)

      if (!withinLimit) {
         allSubscribedUsers = allSubscribedUsers.filter((user) =>
            overrideUsers.includes(user.id)
         )
      }
   }

   const batches = Math.ceil(allSubscribedUsers.length / ITEMS_PER_BATCH)

   logger.info(
      "sendOnboardingNewsletter ~ TOTAL_SUBSCRIBED_USERS,ITEMS_PER_BATCH,TOTAL_BATCHES:",
      allSubscribedUsers.length,
      ITEMS_PER_BATCH,
      batches
   )

   for (let i = 0; i < batches; i++) {
      const batchUsers = paginate(allSubscribedUsers, ITEMS_PER_BATCH, i)

      logger.info("sendOnboardingNewsletter ~ PROCESSING_BATCH:", i)

      // warning: using this outside the loop will cause email duplication
      const emailBuilder = new OnboardingNewsletterEmailBuilder(
         PostmarkEmailSender.create(),
         logger
      )

      const onboardingNewsletterService = new OnboardingNewsletterService(
         userRepo,
         sparkRepo,
         emailNotificationsRepo,
         livestreamsRepo,
         dataLoader,
         emailBuilder,
         batchUsers,
         logger
      )

      await onboardingNewsletterService.fetchRequiredData()

      onboardingNewsletterService.buildDiscoveryLists()

      await onboardingNewsletterService.sendDiscoveryEmails()

      logger.info("OnboardingNewsletter(s) sent batch: ", i)
   }
}

function paginate(array: any[], pageSize: number, pageNumber: number) {
   return array.slice(pageNumber * pageSize, pageNumber * pageSize + pageSize)
}
