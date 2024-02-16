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
   private onboardingUsers: OnboardingUserData[] = []
   private users: UserData[] = []
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
         !user.notifications.companyDiscovery.length && !user.followingCompanies
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
      return !user.notifications.sparksDiscovery.length && seenSparksCount < 5
   }

   private shouldSendLivestream1stRecommendationDiscovery = (
      user: OnboardingUserData
   ): boolean => {
      return (
         !user.notifications.livestream1stRegistrationDiscovery.length &&
         !user.stats.hasRegisteredOnAnyLivestream
      )
   }

   private shouldSendRecordingDiscovery = (
      onboardingUser: OnboardingUserData
   ): boolean => {
      return (
         !onboardingUser.notifications.recordingDiscovery.length &&
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
      // TODO: Set as user has not received notification yet
      return !user.notifications.feedbackDiscovery.length
   }

   private async createDiscoveryEmailNotifications() {
      // TODO: Create method
      const companyDiscoveryNotificationsPromise =
         this.notificationsRepo.createDiscoveryNotifications(
            this.companyDiscoveryUsers.map((u) => u.user.userEmail),
            OnboardingNewsletterEvents.COMPANY_DISCOVERY
         )
      const sparksDiscoveryNotificationsPromise =
         this.notificationsRepo.createDiscoveryNotifications(
            this.sparksDiscoveryUsers.map((u) => u.user.userEmail),
            OnboardingNewsletterEvents.SPARKS_DISCOVERY
         )
      const livestream1stRegistrationDiscoveryNotificationsPromise =
         this.notificationsRepo.createDiscoveryNotifications(
            this.livestream1stRegistrationDiscoveryUsers.map(
               (u) => u.user.userEmail
            ),
            OnboardingNewsletterEvents.LIVESTREAM_1ST_REGISTRATION_DISCOVERY
         )
      const recordingDiscoveryNotificationsPromise =
         this.notificationsRepo.createDiscoveryNotifications(
            this.recordingDiscoveryUsers.map((u) => u.user.userEmail),
            OnboardingNewsletterEvents.RECORDING_DISCOVERY
         )
      const feedbackDiscoveryNotificationsPromise =
         this.notificationsRepo.createDiscoveryNotifications(
            this.feedbackDiscoveryUsers.map((u) => u.user.userEmail),
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

   async fetchUserData(user: UserData): Promise<OnboardingUserData> {
      this.logger.info(`OnboardingNewsletterService starting at ${new Date()}`)
      this.logger.info(
         "OnboardingNewsletterService...sparksRepo:  " + this.sparksRepo
      )
      this.logger.info(
         "OnboardingNewsletterService fetchUserData: sparksRepo - " +
            this.sparksRepo
      )
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
      // Filtering notifications in memory to limit Database queries
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

   private handleUserDiscovery(
      onboardingUserData: OnboardingUserData,
      daysSinceUserRegistration?: number
   ) {
      const fromSkippedDiscovery = daysSinceUserRegistration !== undefined

      // Real user days since registration, as this method can be called recursively with overridden days
      let effectiveUserDaysSinceRegistration = getDateDifferenceInDays(
         onboardingUserData.user.createdAt.toDate(),
         new Date()
      )

      if (fromSkippedDiscovery) {
         console.log(
            "🚀 ~ OnboardingNewsletterService ~ fromSkippedDiscovery:",
            fromSkippedDiscovery
         )
         effectiveUserDaysSinceRegistration = daysSinceUserRegistration
      }
      console.log(
         `🚀 ~ OnboardingNewsletterService...HANDLE_USER_DISCOVERY: user{ ${onboardingUserData.user.userEmail} } - effectiveDaysSinceRegistration: ${effectiveUserDaysSinceRegistration}`
      )
      switch (effectiveUserDaysSinceRegistration) {
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
      this.logger.info("OnboardingNewsletterService... fetching required data")
      this.users = await this.userRepo.getSubscribedUsers()
      const onboardingUserPromises = this.users.map((user) => {
         this.logger.info(
            "OnboardingNewsletterService... mapping user - " + user.userEmail
         )
         return this.fetchUserData(user)
      })

      this.onboardingUsers = await Promise.all(onboardingUserPromises)
      this.logger.info(
         `OnboardingNewsletterService... fetched ${this.onboardingUsers.length} subscribed users`
      )
      console.log(
         "🚀 ~ OnboardingNewsletterService ~ fetchRequiredData ~ this.onboardingUsers:",
         this.onboardingUsers
      )

      // fetch notifications for the users and filter map to users
   }

   buildDiscoveryLists() {
      this.logger.info(
         "OnboardingNewsletterService... building discovery lists & email notification template data"
      )
      this.onboardingUsers.forEach((user) => {
         return this.handleUserDiscovery(user)
      })

      this.emailBuilder
         .addRecipients(
            this.companyDiscoveryUsers.map(
               (onboardingUser) => onboardingUser.user
            ),
            OnboardingNewsletterEvents.COMPANY_DISCOVERY
         )
         .addRecipients(
            this.sparksDiscoveryUsers.map(
               (onboardingUser) => onboardingUser.user
            ),
            OnboardingNewsletterEvents.SPARKS_DISCOVERY
         )
         .addRecipients(
            this.livestream1stRegistrationDiscoveryUsers.map(
               (onboardingUser) => onboardingUser.user
            ),
            OnboardingNewsletterEvents.LIVESTREAM_1ST_REGISTRATION_DISCOVERY
         )
         .addRecipients(
            this.recordingDiscoveryUsers.map(
               (onboardingUser) => onboardingUser.user
            ),
            OnboardingNewsletterEvents.RECORDING_DISCOVERY
         )
         .addRecipients(
            this.feedbackDiscoveryUsers.map(
               (onboardingUser) => onboardingUser.user
            ),
            OnboardingNewsletterEvents.FEEDBACK_DISCOVERY
         )

      this.logger.info(
         "OnboardingNewsletterService... finished building discovery lists & email notification template data"
      )
      this.logger.info(
         "OnboardingNewsletterService... companyDiscoveryUsers: " +
            this.companyDiscoveryUsers
      )
      // TODO: add more logging
   }

   async sendDiscoveryEmails() {
      this.logger.info(
         "OnboardingNewsletterService.... Sending discovery emails ...."
      )
      this.logger.info(
         "OnboardingNewsletterService......... companyDiscovery ..........."
      )

      this.logDiscoveryEmails()
      await this.emailBuilder.sendAll()
      await this.createDiscoveryEmailNotifications()
      return
   }
   private logDiscoveryEmails() {
      this.emailBuilder
         .getTemplate(OnboardingNewsletterEvents.COMPANY_DISCOVERY)
         .forEach((templateMessage) => {
            this.logger.info(
               `...................................... to: ${templateMessage.To} ...........`
            )
         })
      this.logger.info(
         "OnboardingNewsletterService......... sparksDiscovery ..........."
      )
      this.emailBuilder
         .getTemplate(OnboardingNewsletterEvents.SPARKS_DISCOVERY)
         .forEach((templateMessage) => {
            this.logger.info(
               `...................................... to: ${templateMessage.To} ...........`
            )
         })
      this.logger.info(
         "OnboardingNewsletterService......... livestream1stRegistrationDiscovery ..........."
      )
      this.emailBuilder
         .getTemplate(
            OnboardingNewsletterEvents.LIVESTREAM_1ST_REGISTRATION_DISCOVERY
         )
         .forEach((templateMessage) => {
            this.logger.info(
               `...................................... to: ${templateMessage.To} ...........`
            )
         })
      this.logger.info(
         "OnboardingNewsletterService......... recordingDiscovery ..........."
      )
      this.emailBuilder
         .getTemplate(OnboardingNewsletterEvents.RECORDING_DISCOVERY)
         .forEach((templateMessage) => {
            this.logger.info(
               `...................................... to: ${templateMessage.To} ...........`
            )
         })
      this.logger.info(
         "OnboardingNewsletterService......... feedbackDiscovery ..........."
      )
      this.emailBuilder
         .getTemplate(OnboardingNewsletterEvents.FEEDBACK_DISCOVERY)
         .forEach((templateMessage) => {
            this.logger.info(
               `...................................... to: ${templateMessage.To} ...........`
            )
         })
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
