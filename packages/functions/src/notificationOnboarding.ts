import { logger } from "firebase-functions"
import { onSchedule } from "firebase-functions/v2/scheduler"
import { userRepo } from "./api/repositories"

/**
 * OnboardingNotifications functions runtime settings
 */
const runtimeOptions = {
   // may take a while
   // TODO: function was changed to http trigger to allow for more time. In the future, optimize fetchRequiredData function
   // as it's being called for each batch, taking up a lot of time
   timeoutSeconds: 60 * 60,
   // we may load lots of data into memory
   memory: "8GiB",
} as const

export const notificationOnboarding = onSchedule(
   {
      schedule: "0 17 * * *", // everyday at 17:00
      timeZone: "Europe/Zurich",
      ...runtimeOptions,
   },
   async () => {
      logger.info("Starting execution of OnboardingPushNotificationService")
      await sendOnboardingPushNotification()
   }
)

async function sendOnboardingPushNotification() {
   logger.info("sendOnboardingPushNotification ~ V3 ")
   return userRepo.getRegisteredUsersWithinTwoDaysAndSendNotifications()
}
