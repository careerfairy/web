import { UserData, UserStats } from "@careerfairy/shared-lib/users"
import { IUserFunctionsRepository } from "../../UserFunctionsRepository"
import { ISparkFunctionsRepository } from "../../sparks/SparkFunctionsRepository"
import { SeenSparks } from "@careerfairy/shared-lib/sparks/sparks"
import { Logger } from "@careerfairy/shared-lib/utils/types"
import { OnboardingNewsletterEmailBuilder } from "../onboarding/OnboardingNewsletterEmailBuilder"
import { INotificationRepository } from "@careerfairy/shared-lib/notifications/INotificationRepository"
import {
   EmailNotificationType,
   EmailNotification,
} from "@careerfairy/shared-lib/notifications/notifications"
import { ILivestreamRepository } from "@careerfairy/shared-lib/livestreams/LivestreamRepository"
import { LivestreamRecordingDetails } from "@careerfairy/shared-lib/livestreams"
import { Timestamp } from "firebase-admin/firestore"

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
   private onboardingUsers: OnboardingUserData[]
   private users: UserData[]
   private companyDiscoveryEmails: string[]
   private livestream1stRegistrationDiscoveryEmails: string[]
   private sparksDiscoveryEmails: string[]
   private recordingDiscoveryEmails: string[]
   private feedbackDiscoveryEmails: string[]

   constructor(
      private readonly userRepo: IUserFunctionsRepository,
      private readonly sparksRepo: ISparkFunctionsRepository,
      private readonly notificationsRepo: INotificationRepository,
      private readonly livestreamsRepo: ILivestreamRepository,
      private readonly emailBuilder: OnboardingNewsletterEmailBuilder,
      private readonly logger: Logger
   ) {}

   private shouldSendCompanyDiscovery = (user: OnboardingUserData): boolean => {
      return (
         !user.notifications.companyDiscovery.length && user.followingCompanies
      )
   }
   private shouldSendSparksDiscovery = (user: OnboardingUserData): boolean => {
      return (
         !user.notifications.sparksDiscovery.length &&
         user.seenSparks.length >= 5
      )
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

   private createNotifications(
      type: EmailNotificationType,
      creationDate: Timestamp,
      userEmails
   ) {
      // TODO: Create method
      console.log(type, creationDate, userEmails)
   }

   async fetchRequiredData() {
      this.users = await this.userRepo.getSubscribedUsers()
      const onboardingUserPromises = this.users.map(this.fetchUserData)

      this.onboardingUsers = await Promise.all(onboardingUserPromises)
      // fetch notifications for the users and filter map to users
   }

   async fetchUserData(user: UserData): Promise<OnboardingUserData> {
      const seenSparksPromise = this.sparksRepo.getUserSparkInteraction(
         user.id,
         "seenSparks"
      )
      const companiesUserFollowsPromise = this.userRepo
         .getCompaniesUserFollowsQuery(user.id, 1)
         .get()
      const userStatsPromise = this.userRepo.getUserStats(user.userEmail)
      const userNotificationsPromise =
         this.notificationsRepo.getUserReceivedNotifications(user.userEmail)

      const [seenSparks, companiesUserFollows, userStats, userNotifications] =
         await Promise.all([
            seenSparksPromise,
            companiesUserFollowsPromise,
            userStatsPromise,
            userNotificationsPromise,
         ])

      const userRecordingStatsPromises = userStats.recordingsBought.map(
         this.livestreamsRepo.getLivestreamRecordingStats
      )
      const recordingStats = await Promise.all(userRecordingStatsPromises)
      // Filtering notifications in memory to limit Database queries
      const companyDiscoveryNotifications = userNotifications.filter(
         (notification) => notification.details.type == "companyDiscovery"
      )
      const sparksDiscoveryNotifications = userNotifications.filter(
         (notification) => notification.details.type == "sparksDiscovery"
      )
      const livestream1stRegistrationDiscoveryNotifications =
         userNotifications.filter(
            (notification) =>
               notification.details.type == "livestream1stRegistrationDiscovery"
         )
      const recordingDiscoveryNotifications = userNotifications.filter(
         (notification) => notification.details.type == "recordingDiscovery"
      )
      const feedbackDiscoveryNotifications = userNotifications.filter(
         (notification) => notification.details.type == "feedbackDiscovery"
      )

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
   buildDiscoveryLists() {
      this.onboardingUsers.forEach(this.handleUserDiscovery)
      this.createNotifications(null, null, null)
   }

   handleUserDiscovery(
      onboardingUserData: OnboardingUserData,
      daysSinceRegistration?: number
   ) {
      const fromSkippedDiscovery = daysSinceRegistration !== undefined

      const now = new Date()
      const diffTime = Math.abs(
         now.getDate() - onboardingUserData.user.createdAt.toDate().getDate()
      )
      // Real user days since registration, as this method can be called recursively with overridden days
      const effectiveUserDaysSinceRegistration = Math.ceil(
         diffTime / (1000 * 60 * 60 * 24)
      )

      if (!fromSkippedDiscovery) {
         daysSinceRegistration = effectiveUserDaysSinceRegistration
      }

      switch (daysSinceRegistration) {
         case COMPANY_DISCOVERY_TRIGGER_DAY: {
            this.applyDiscovery(
               onboardingUserData,
               this.shouldSendCompanyDiscovery(onboardingUserData),
               this.companyDiscoveryEmails,
               () =>
                  this.handleUserDiscovery(
                     onboardingUserData,
                     SPARKS_DISCOVERY_TRIGGER_DAY
                  )
            )
            break
         }
         case SPARKS_DISCOVERY_TRIGGER_DAY: {
            this.applyDiscovery(
               onboardingUserData,
               this.shouldSendSparksDiscovery(onboardingUserData),
               this.sparksDiscoveryEmails,
               () =>
                  this.handleUserDiscovery(
                     onboardingUserData,
                     LIVESTREAM_1ST_REGISTRATION_DISCOVERY_TRIGGER_DAY
                  )
            )
            break
         }
         case LIVESTREAM_1ST_REGISTRATION_DISCOVERY_TRIGGER_DAY: {
            this.applyDiscovery(
               onboardingUserData,
               this.shouldSendLivestream1stRecommendationDiscovery(
                  onboardingUserData
               ),
               this.livestream1stRegistrationDiscoveryEmails,
               () =>
                  this.handleUserDiscovery(
                     onboardingUserData,
                     RECORDING_DISCOVERY_TRIGGER_DAY
                  )
            )
            break
         }
         case RECORDING_DISCOVERY_TRIGGER_DAY: {
            this.applyDiscovery(
               onboardingUserData,
               this.shouldSendRecordingDiscovery(onboardingUserData),
               this.recordingDiscoveryEmails,
               () =>
                  this.handleUserDiscovery(
                     onboardingUserData,
                     FEEDBACK_DISCOVERY_TRIGGER_DAY
                  )
            )
            break
         }
         case FEEDBACK_DISCOVERY_TRIGGER_DAY: {
            const shouldSendDiscovery =
               this.shouldSendFeedbackDiscovery(onboardingUserData)

            if (
               fromSkippedDiscovery &&
               effectiveUserDaysSinceRegistration >= 25
            )
               this.applyDiscovery(
                  onboardingUserData,
                  shouldSendDiscovery,
                  this.feedbackDiscoveryEmails
               )

            if (!fromSkippedDiscovery)
               this.applyDiscovery(
                  onboardingUserData,
                  shouldSendDiscovery,
                  this.feedbackDiscoveryEmails
               )
            break
         }
         default: {
            break
         }
      }
   }

   applyDiscovery(
      onboardingUserData: OnboardingUserData,
      predicate: boolean,
      emails: string[],
      next?: () => void
   ) {
      if (predicate) emails.push(onboardingUserData.user.userEmail)
      else if (next) {
         next()
      }
   }
}
