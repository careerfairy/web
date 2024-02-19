import { UserData, UserStats } from "@careerfairy/shared-lib/users"
import { IUserFunctionsRepository } from "../../UserFunctionsRepository"
import { ISparkFunctionsRepository } from "../../sparks/SparkFunctionsRepository"
import { SeenSparks } from "@careerfairy/shared-lib/sparks/sparks"
import { Logger } from "@careerfairy/shared-lib/utils/types"
import {
   OnboardingNewsletterEmailBuilder,
   OnboardingNewsletterEvents,
} from "../onboarding/OnboardingNewsletterEmailBuilder"
import { EmailNotification } from "@careerfairy/shared-lib/notifications/notifications"
import { IEmailNotificationRepository as IEmailFunctionsNotificationRepository } from "@careerfairy/shared-lib/notifications/IEmailNotificationRepository"
import { ILivestreamRepository } from "@careerfairy/shared-lib/livestreams/LivestreamRepository"
import { LivestreamRecordingDetails } from "@careerfairy/shared-lib/livestreams"

const COMPANY_DISCOVERY_TRIGGER_DAY = 4
const SPARKS_DISCOVERY_TRIGGER_DAY = 9
const LIVESTREAM_1ST_REGISTRATION_DISCOVERY_TRIGGER_DAY = 14
const RECORDING_DISCOVERY_TRIGGER_DAY = 30
const FEEDBACK_DISCOVERY_TRIGGER_DAY = 45

type OnboardingUserDataNotifications = {
   companyDiscovery: EmailNotification[]
   sparksDiscovery: EmailNotification[]
   livestream1stRegistrationDiscovery: EmailNotification[]
   recordingDiscovery: EmailNotification[]
   feedbackDiscovery: EmailNotification[]
}
type OnboardingUserData = {
   user: UserData
   seenSparks: SeenSparks[]
   followingCompanies: boolean
   stats: UserStats
   recordingStats: LivestreamRecordingDetails[]
   notifications: OnboardingUserDataNotifications
}
export class OnboardingNewsletterService {
   // User data with required fields for onboarding logic evaluation
   private onboardingUsers: OnboardingUserData[] = []

   // Discovery user lists
   private companyDiscoveryUsers: OnboardingUserData[] = []
   private livestream1stRegistrationDiscoveryUsers: OnboardingUserData[] = []
   private sparksDiscoveryUsers: OnboardingUserData[] = []
   private recordingDiscoveryUsers: OnboardingUserData[] = []
   private feedbackDiscoveryUsers: OnboardingUserData[] = []

   constructor(
      private readonly userRepo: IUserFunctionsRepository,
      private readonly sparksRepo: ISparkFunctionsRepository,
      private readonly notificationsRepo: IEmailFunctionsNotificationRepository,
      private readonly livestreamsRepo: ILivestreamRepository,
      private readonly emailBuilder: OnboardingNewsletterEmailBuilder,
      private readonly logger: Logger
   ) {
      this.logger.info("OnboardingNewsletterService...")
   }

   private shouldSendCompanyDiscovery = (user: OnboardingUserData): boolean => {
      return (
         !this.hasNotifications([
            user.notifications.companyDiscovery,
            user.notifications.sparksDiscovery,
            user.notifications.livestream1stRegistrationDiscovery,
            user.notifications.recordingDiscovery,
            user.notifications.feedbackDiscovery,
         ]) && !user.followingCompanies
      )
   }
   private shouldSendSparksDiscovery = (user: OnboardingUserData): boolean => {
      const seenSparksCount =
         (user.seenSparks.length &&
            user.seenSparks
               .map(
                  (seenSparkYearDocument) =>
                     Object.keys(seenSparkYearDocument.sparks).length
               )
               .reduce((prev, current) => prev + current)) ||
         0
      console.log(
         "🚀 ~ OnboardingNewsletterService ~ seenSparksCount:",
         seenSparksCount
      )
      console.log(
         "🚀 ~ OnboardingNewsletterService ~ user.notifications.sparksDiscovery.length:",
         user.notifications.sparksDiscovery.length
      )
      return (
         !this.hasNotifications([
            user.notifications.sparksDiscovery,
            user.notifications.livestream1stRegistrationDiscovery,
            user.notifications.recordingDiscovery,
            user.notifications.feedbackDiscovery,
         ]) &&
         !user.notifications.sparksDiscovery.length &&
         seenSparksCount < 5
      )
   }

   private shouldSendLivestream1stRecommendationDiscovery = (
      user: OnboardingUserData
   ): boolean => {
      return (
         !this.hasNotifications([
            user.notifications.livestream1stRegistrationDiscovery,
            user.notifications.recordingDiscovery,
            user.notifications.feedbackDiscovery,
         ]) && !user.stats.hasRegisteredOnAnyLivestream
      )
   }

   private shouldSendRecordingDiscovery = (
      onboardingUser: OnboardingUserData
   ): boolean => {
      return (
         !this.hasNotifications([
            onboardingUser.notifications.recordingDiscovery,
            onboardingUser.notifications.feedbackDiscovery,
         ]) &&
         !onboardingUser.recordingStats.find((stat) =>
            Boolean(
               stat.viewers.find(
                  (viewer) => viewer === onboardingUser.user.userEmail
               )
            )
         )
      )
   }
   private shouldSendFeedbackDiscovery = (
      user: OnboardingUserData
   ): boolean => {
      return !user.notifications.feedbackDiscovery.length
   }

   private hasNotifications(notifications: EmailNotification[][]) {
      return (
         notifications.length &&
         notifications.find((items) => Boolean(items.length)) !== undefined
      )
   }

   /**
    * Create entries in collection emailNotifications for the different types for each user, useful
    * for checking if certain types of email discoveries have already been sent.
    */
   private async createDiscoveryEmailNotifications() {
      const userEmailMapper = (oUser: OnboardingUserData) =>
         oUser.user.userEmail
      const companyDiscoveryNotificationsPromise =
         this.notificationsRepo.createNotifications(
            this.companyDiscoveryUsers.map(userEmailMapper),
            OnboardingNewsletterEvents.COMPANY_DISCOVERY
         )
      const sparksDiscoveryNotificationsPromise =
         this.notificationsRepo.createNotifications(
            this.sparksDiscoveryUsers.map(userEmailMapper),
            OnboardingNewsletterEvents.SPARKS_DISCOVERY
         )
      const livestream1stRegistrationDiscoveryNotificationsPromise =
         this.notificationsRepo.createNotifications(
            this.livestream1stRegistrationDiscoveryUsers.map(userEmailMapper),
            OnboardingNewsletterEvents.LIVESTREAM_1ST_REGISTRATION_DISCOVERY
         )
      const recordingDiscoveryNotificationsPromise =
         this.notificationsRepo.createNotifications(
            this.recordingDiscoveryUsers.map(userEmailMapper),
            OnboardingNewsletterEvents.RECORDING_DISCOVERY
         )
      const feedbackDiscoveryNotificationsPromise =
         this.notificationsRepo.createNotifications(
            this.feedbackDiscoveryUsers.map(userEmailMapper),
            OnboardingNewsletterEvents.FEEDBACK_DISCOVERY
         )

      return await Promise.all([
         companyDiscoveryNotificationsPromise,
         sparksDiscoveryNotificationsPromise,
         livestream1stRegistrationDiscoveryNotificationsPromise,
         recordingDiscoveryNotificationsPromise,
         feedbackDiscoveryNotificationsPromise,
      ])
   }

   /**
    * Fetches all necessary user data for evaluating discovery states and decide on the specific logic to
    * be applied accordingly.
    * After fetching all needed data, the user is stored as @type OnboardingUserData, with all the needed properties for logic
    * evaluation.
    * @param user UserData with basic user fields, used to infer remaining data: notifications, sparksSeen, etc.
    * @returns Promise fulfilling when all other Promises related to the user data are also fulfilled with the
    * calculated OnboardingUserData.
    */
   async fetchUserData(user: UserData): Promise<OnboardingUserData> {
      const seenSparksPromise = this.sparksRepo.getUserSparkInteraction(
         user.id,
         "seenSparks"
      )
      const companiesUserFollowsPromise = this.userRepo
         .getCompaniesUserFollowsQuery(user.id, 1)
         .get()
      const userStatsPromise = this.userRepo.getUserStats(user.userEmail)

      const userNotificationsPromises = [
         this.notificationsRepo.getUserReceivedNotifications(
            user.userEmail,
            "companyDiscovery"
         ),
         this.notificationsRepo.getUserReceivedNotifications(
            user.userEmail,
            "sparksDiscovery"
         ),
         this.notificationsRepo.getUserReceivedNotifications(
            user.userEmail,
            "livestream1stRegistrationDiscovery"
         ),
         this.notificationsRepo.getUserReceivedNotifications(
            user.userEmail,
            "recordingDiscovery"
         ),
         this.notificationsRepo.getUserReceivedNotifications(
            user.userEmail,
            "feedbackDiscovery"
         ),
      ]
      const [seenSparks, companiesUserFollows, userStats] = await Promise.all([
         seenSparksPromise,
         companiesUserFollowsPromise,
         userStatsPromise,
      ])

      const userRecordingStatsPromises = userStats.recordingsBought?.map(
         this.livestreamsRepo.getLivestreamRecordingStats
      )
      const recordingStats = userRecordingStatsPromises?.length
         ? await Promise.all(userRecordingStatsPromises)
         : []

      const [
         companyDiscoveryNotifications,
         sparksDiscoveryNotifications,
         livestream1stRegistrationDiscoveryNotifications,
         recordingDiscoveryNotifications,
         feedbackDiscoveryNotifications,
      ] = await Promise.all(userNotificationsPromises)

      return {
         user: user,
         seenSparks: seenSparks,
         followingCompanies: companiesUserFollows.size > 0,
         stats: userStats,
         recordingStats: recordingStats,
         notifications: {
            companyDiscovery: companyDiscoveryNotifications,
            sparksDiscovery: sparksDiscoveryNotifications,
            livestream1stRegistrationDiscovery:
               livestream1stRegistrationDiscoveryNotifications,
            recordingDiscovery: recordingDiscoveryNotifications,
            feedbackDiscovery: feedbackDiscoveryNotifications,
         },
      } as OnboardingUserData
   }

   /**
    * Main onboarding project logic, based on the calculated OnboardingUserData, determines to which batch of email notification
    * discoveries the user shall be attached to, depending on the days since registration, with some determined days serving as trigger for
    * the main logic.
    * Certain scenarios, foresee evaluating the next condition on the same trigger day, thus for certain conditions, if not met, this function can be called recursively, which just means evaluating the next discovery condition on the
    * present condition trigger day.
    * @param onboardingUserData User data for main logic (stats, notifications, etc.)
    * @param daysSinceUserRegistration Optional parameter, when present overrides the days since the user was created with this value instead
    * of calculating based on creationDate.
    */
   private handleUserDiscovery(
      onboardingUserData: OnboardingUserData,
      daysSinceUserRegistration?: number
   ) {
      const fromSkippedDiscovery = daysSinceUserRegistration !== undefined

      // Real user days since registration, as this method can be called recursively with overridden days
      const effectiveUserDaysSinceRegistration = getDateDifferenceInDays(
         onboardingUserData.user.createdAt.toDate(), // TODO: check if other property check is needed
         new Date()
      )

      console.log(
         `🚀 ~ OnboardingNewsletterService ~ handleUserDiscovery ~ effectiveUserDaysSinceRegistration - ${
            onboardingUserData.user.userEmail
         }: creationDate - ${onboardingUserData.user.createdAt
            .toDate()
            .toISOString()} current - ${new Date().toISOString()}`,
         effectiveUserDaysSinceRegistration
      )

      let userDaysSinceRegistration = effectiveUserDaysSinceRegistration
      if (fromSkippedDiscovery) {
         console.log(
            "🚀 ~ OnboardingNewsletterService ~ fromSkippedDiscovery:",
            fromSkippedDiscovery
         )
         userDaysSinceRegistration = daysSinceUserRegistration
      }
      console.log(
         `🚀 ~ OnboardingNewsletterService...HANDLE_USER_DISCOVERY: user{ ${onboardingUserData.user.userEmail} } - effectiveDaysSinceRegistration: ${userDaysSinceRegistration}`
      )
      switch (userDaysSinceRegistration) {
         case COMPANY_DISCOVERY_TRIGGER_DAY: {
            console.log(
               `🚀 ~ OnboardingNewsletterService.......COMPANY_DISCOVERY user{ ${onboardingUserData.user.userEmail} } - DAY: ${COMPANY_DISCOVERY_TRIGGER_DAY}`
            )
            this.applyDiscovery(
               onboardingUserData,
               this.shouldSendCompanyDiscovery(onboardingUserData),
               this.companyDiscoveryUsers,
               () =>
                  this.handleUserDiscovery(
                     onboardingUserData,
                     SPARKS_DISCOVERY_TRIGGER_DAY
                  )
            )
            break
         }
         case SPARKS_DISCOVERY_TRIGGER_DAY: {
            console.log(
               `🚀 ~ OnboardingNewsletterService.......SPARKS_DISCOVERY user{ ${onboardingUserData.user.userEmail} } - DAY: ${SPARKS_DISCOVERY_TRIGGER_DAY}`
            )
            this.applyDiscovery(
               onboardingUserData,
               this.shouldSendSparksDiscovery(onboardingUserData),
               this.sparksDiscoveryUsers,
               () =>
                  this.handleUserDiscovery(
                     onboardingUserData,
                     LIVESTREAM_1ST_REGISTRATION_DISCOVERY_TRIGGER_DAY
                  )
            )
            break
         }
         case LIVESTREAM_1ST_REGISTRATION_DISCOVERY_TRIGGER_DAY: {
            console.log(
               `🚀 ~ OnboardingNewsletterService.......LIVESTREAM_1ST_REGISTRATION_DISCOVERY user{ ${onboardingUserData.user.userEmail} } - DAY: ${LIVESTREAM_1ST_REGISTRATION_DISCOVERY_TRIGGER_DAY}`
            )
            this.applyDiscovery(
               onboardingUserData,
               this.shouldSendLivestream1stRecommendationDiscovery(
                  onboardingUserData
               ),
               this.livestream1stRegistrationDiscoveryUsers,
               () =>
                  this.handleUserDiscovery(
                     onboardingUserData,
                     RECORDING_DISCOVERY_TRIGGER_DAY
                  )
            )
            break
         }
         case RECORDING_DISCOVERY_TRIGGER_DAY: {
            console.log(
               `🚀 ~ OnboardingNewsletterService.......RECORDING_DISCOVERY user{ ${onboardingUserData.user.userEmail} } - DAY: ${RECORDING_DISCOVERY_TRIGGER_DAY}`
            )
            this.applyDiscovery(
               onboardingUserData,
               this.shouldSendRecordingDiscovery(onboardingUserData),
               this.recordingDiscoveryUsers,
               () =>
                  this.handleUserDiscovery(
                     onboardingUserData,
                     FEEDBACK_DISCOVERY_TRIGGER_DAY
                  )
            )
            break
         }
         case FEEDBACK_DISCOVERY_TRIGGER_DAY: {
            console.log(
               `🚀 ~ OnboardingNewsletterService.......FEEDBACK_DISCOVERY user{ ${onboardingUserData.user.userEmail} } - DAY: ${FEEDBACK_DISCOVERY_TRIGGER_DAY}`
            )
            const shouldSendDiscovery =
               this.shouldSendFeedbackDiscovery(onboardingUserData)

            if (
               fromSkippedDiscovery &&
               effectiveUserDaysSinceRegistration >= 25
            )
               this.applyDiscovery(
                  onboardingUserData,
                  shouldSendDiscovery,
                  this.feedbackDiscoveryUsers
               )

            if (!fromSkippedDiscovery)
               this.applyDiscovery(
                  onboardingUserData,
                  shouldSendDiscovery,
                  this.feedbackDiscoveryUsers
               )
            break
         }
         default: {
            console.log(
               `🚀 ~ OnboardingNewsletterService.......IGNORE-- user{ ${onboardingUserData.user.userEmail} } - user is on day: ${effectiveUserDaysSinceRegistration} --IGNORE`
            )
            break
         }
      }
   }

   private applyDiscovery(
      onboardingUserData: OnboardingUserData,
      predicate: boolean,
      users: OnboardingUserData[],
      next?: () => void
   ) {
      if (predicate) users.push(onboardingUserData)
      else if (next) {
         next()
      }
   }

   async fetchRequiredData() {
      this.logger.info("Fetching required data")
      const users = await this.userRepo.getSubscribedUsers()
      const onboardingUserPromises = users.map((user) => {
         return this.fetchUserData(user)
      })

      this.onboardingUsers = await Promise.all(onboardingUserPromises)

      this.logger.info(
         `Fetched ${this.onboardingUsers.length} subscribed users`
      )
   }

   buildDiscoveryLists() {
      this.logger.info(
         "Building discovery lists & email notification template data"
      )
      this.onboardingUsers.forEach((user) => {
         return this.handleUserDiscovery(user)
      })
      const userDataMapper = (user: OnboardingUserData) => user.user

      this.emailBuilder
         .addRecipients(
            this.companyDiscoveryUsers.map(userDataMapper),
            OnboardingNewsletterEvents.COMPANY_DISCOVERY
         )
         .addRecipients(
            this.sparksDiscoveryUsers.map(userDataMapper),
            OnboardingNewsletterEvents.SPARKS_DISCOVERY
         )
         .addRecipients(
            this.livestream1stRegistrationDiscoveryUsers.map(userDataMapper),
            OnboardingNewsletterEvents.LIVESTREAM_1ST_REGISTRATION_DISCOVERY
         )
         .addRecipients(
            this.recordingDiscoveryUsers.map(userDataMapper),
            OnboardingNewsletterEvents.RECORDING_DISCOVERY
         )
         .addRecipients(
            this.feedbackDiscoveryUsers.map(userDataMapper),
            OnboardingNewsletterEvents.FEEDBACK_DISCOVERY
         )

      this.logger.info(
         "OnboardingNewsletterService... finished building discovery lists & email notification template data"
      )
   }

   async sendDiscoveryEmails() {
      await this.emailBuilder.sendAll()
      await this.createDiscoveryEmailNotifications()
   }
}

// TODO: Check if ignore hour comparison, since the schedule would be everyday at a specific time
// Use minutes in day difference ? Even though the user is on the correct day, but created an account on a later
// hour/minute/second than the running function
const getDateDifferenceInDays = (dateFrom: Date, dateTo: Date): number => {
   const diff = Math.abs(dateFrom.getTime() - dateTo.getTime())
   const diffDays = Math.ceil(diff / (1000 * 3600 * 24))
   return diffDays
}
