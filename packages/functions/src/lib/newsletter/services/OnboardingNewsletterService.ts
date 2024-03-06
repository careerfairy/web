import { UserData, UserStats } from "@careerfairy/shared-lib/users"
import { IUserFunctionsRepository } from "../../UserFunctionsRepository"
import { ISparkFunctionsRepository } from "../../sparks/SparkFunctionsRepository"
import { SeenSparks } from "@careerfairy/shared-lib/sparks/sparks"
import { Logger } from "@careerfairy/shared-lib/utils/types"
import {
   LivestreamDiscoveryData,
   OnboardingNewsletterEmailBuilder,
   OnboardingNewsletterEvents,
} from "../onboarding/OnboardingNewsletterEmailBuilder"
import { EmailNotification } from "@careerfairy/shared-lib/notifications/notifications"
import { IEmailNotificationRepository as IEmailFunctionsNotificationRepository } from "@careerfairy/shared-lib/notifications/IEmailNotificationRepository"
import { ILivestreamRepository } from "@careerfairy/shared-lib/livestreams/LivestreamRepository"
import {
   LivestreamEvent,
   LivestreamRecordingDetails,
} from "@careerfairy/shared-lib/livestreams"
import { IRecommendationDataFetcher } from "src/lib/recommendation/services/DataFetcherRecommendations"
import UserEventRecommendationService from "../../recommendation/UserEventRecommendationService"
import { DateTime } from "luxon"
import {
   addUtmTagsToLink,
   getDateDifferenceInDays,
} from "@careerfairy/shared-lib/utils"
import { makeLivestreamEventDetailsUrl } from "@careerfairy/shared-lib/utils/urls"

const FEEDBACK_DISCOVERY_TRIGGER_DAY_FROM_SKIPPED = 25
const MAX_SPARKS_COUNT = 5

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
   private futureLivestreams: LivestreamEvent[]
   private pastLivestreams: LivestreamEvent[]

   private userRecommendedLivestreams: Record<string, LivestreamEvent[]> = {}

   constructor(
      private readonly userRepo: IUserFunctionsRepository,
      private readonly sparksRepo: ISparkFunctionsRepository,
      private readonly notificationsRepo: IEmailFunctionsNotificationRepository,
      private readonly livestreamsRepo: ILivestreamRepository,
      private readonly dataLoader: IRecommendationDataFetcher,
      private readonly emailBuilder: OnboardingNewsletterEmailBuilder,
      private readonly allUsers: UserData[],
      private readonly logger: Logger
   ) {
      this.logger.info("OnboardingNewsletterService...")
   }

   getUsers(): UserData[] {
      return this.onboardingUsers.map((onboardingUser) => onboardingUser.user)
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

      return (
         !this.hasNotifications([
            user.notifications.sparksDiscovery,
            user.notifications.livestream1stRegistrationDiscovery,
            user.notifications.recordingDiscovery,
            user.notifications.feedbackDiscovery,
         ]) && seenSparksCount < MAX_SPARKS_COUNT
      )
   }

   // Always send unless already sent or next events already sent as well (any of the next)
   private shouldSendLivestream1stRecommendationDiscovery = (
      user: OnboardingUserData
   ): boolean => {
      return !this.hasNotifications([
         user.notifications.livestream1stRegistrationDiscovery,
         user.notifications.recordingDiscovery,
         user.notifications.feedbackDiscovery,
      ])
   }

   private shouldSendRecordingDiscovery = (
      onboardingUser: OnboardingUserData
   ): boolean => {
      const hasWatchedRecording = Boolean(
         onboardingUser.recordingStats.find((stat) =>
            Boolean(
               stat?.viewers.find((viewer) => viewer === onboardingUser.user.id)
            )
         )
      )

      return (
         !this.hasNotifications([
            onboardingUser.notifications.recordingDiscovery,
            onboardingUser.notifications.feedbackDiscovery,
         ]) && !hasWatchedRecording
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
         Boolean(notifications.find((items) => Boolean(items.length)))
      )
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

   private mapLivestreamToTemplate(livestream: LivestreamEvent) {
      const date = DateTime.fromJSDate(livestream.start.toDate())
      const link = makeLivestreamEventDetailsUrl(livestream.id)
      let shortTitle = livestream.title

      if (shortTitle.length > 60) {
         if (shortTitle.charAt(59) == " ")
            shortTitle = shortTitle.substring(0, 59).trim().concat("...")
         else {
            const parts = shortTitle.substring(0, 59).split(" ")
            parts[parts.length - 1] = ""
            shortTitle = parts.join(" ").concat("...")
         }
      }

      return {
         image: livestream.companyLogoUrl,
         title: livestream.title,
         shortTitle: shortTitle,
         date: date.toFormat("dd LLLL yyyy"),
         link: addUtmTagsToLink({
            link,
            campaign: "talent-guidance",
            content: "newsletter",
         }),
      }
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
      const userCreationDate =
         onboardingUserData.user.createdAt?.toDate?.() ?? new Date()

      const effectiveUserDaysSinceRegistration = getDateDifferenceInDays(
         userCreationDate,
         new Date()
      )

      let userDaysSinceRegistration = effectiveUserDaysSinceRegistration
      if (fromSkippedDiscovery) {
         userDaysSinceRegistration = daysSinceUserRegistration
      }
      switch (userDaysSinceRegistration) {
         case COMPANY_DISCOVERY_TRIGGER_DAY: {
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
            const shouldSendDiscovery =
               this.shouldSendFeedbackDiscovery(onboardingUserData)

            if (
               fromSkippedDiscovery &&
               effectiveUserDaysSinceRegistration >=
                  FEEDBACK_DISCOVERY_TRIGGER_DAY_FROM_SKIPPED
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
            break
         }
      }
   }

   /**
    * Create entries in collection emailNotifications for the different types for each user, useful
    * for checking if certain types of email discoveries have already been sent.
    */
   private async createDiscoveryEmailNotifications() {
      const userEmailMapper = (onboardingUserData: OnboardingUserData) =>
         onboardingUserData.user.id
      const companyDiscoveryNotificationsPromise =
         this.notificationsRepo.createNotificationDocs(
            this.companyDiscoveryUsers.map(userEmailMapper),
            OnboardingNewsletterEvents.COMPANY_DISCOVERY
         )
      const sparksDiscoveryNotificationsPromise =
         this.notificationsRepo.createNotificationDocs(
            this.sparksDiscoveryUsers.map(userEmailMapper),
            OnboardingNewsletterEvents.SPARKS_DISCOVERY
         )
      const livestream1stRegistrationDiscoveryNotificationsPromise =
         this.notificationsRepo.createNotificationDocs(
            this.livestream1stRegistrationDiscoveryUsers.map(userEmailMapper),
            OnboardingNewsletterEvents.LIVESTREAM_1ST_REGISTRATION_DISCOVERY
         )
      const recordingDiscoveryNotificationsPromise =
         this.notificationsRepo.createNotificationDocs(
            this.recordingDiscoveryUsers.map(userEmailMapper),
            OnboardingNewsletterEvents.RECORDING_DISCOVERY
         )
      const feedbackDiscoveryNotificationsPromise =
         this.notificationsRepo.createNotificationDocs(
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
    * Generates the recommendations for each user and populates the users object
    */
   private async generateRecommendations() {
      const promises = this.onboardingUsers.map(async (onboardingUser) => {
         const recommendationService = new UserEventRecommendationService(
            onboardingUser.user,
            this.futureLivestreams,
            this.pastLivestreams,
            false
         )

         const recommendedIds = await recommendationService.getRecommendations(
            3
         )
         this.userRecommendedLivestreams[onboardingUser.user.id] =
            recommendedIds.map((id) =>
               this.futureLivestreams.find((s) => s.id === id)
            )
      })

      return await Promise.all(promises)
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

      const userStats = await this.userRepo.getUserStats(user.id)

      const userNotificationsPromises = [
         this.notificationsRepo.getUserReceivedNotifications(
            user.id,
            "companyDiscovery"
         ),
         this.notificationsRepo.getUserReceivedNotifications(
            user.id,
            "sparksDiscovery"
         ),
         this.notificationsRepo.getUserReceivedNotifications(
            user.id,
            "livestream1stRegistrationDiscovery"
         ),
         this.notificationsRepo.getUserReceivedNotifications(
            user.id,
            "recordingDiscovery"
         ),
         this.notificationsRepo.getUserReceivedNotifications(
            user.id,
            "feedbackDiscovery"
         ),
      ]

      const userRecordingStatsPromises =
         (Boolean(userStats) &&
            Boolean(userStats?.recordingsBought?.length) &&
            userStats?.recordingsBought?.map((livestreamId) => {
               return this.livestreamsRepo.getLivestreamRecordingStats(
                  livestreamId
               )
            })) ||
         []

      const [
         recordingStats,
         seenSparks,
         companiesUserFollows,
         [
            companyDiscoveryNotifications,
            sparksDiscoveryNotifications,
            livestream1stRegistrationDiscoveryNotifications,
            recordingDiscoveryNotifications,
            feedbackDiscoveryNotifications,
         ],
      ] = await Promise.all([
         Promise.all(userRecordingStatsPromises),
         seenSparksPromise,
         companiesUserFollowsPromise,
         Promise.all(userNotificationsPromises),
      ])

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
    * Fetches all required data for correctly dispatching users to the most relevant discoveries.
    */
   async fetchRequiredData() {
      this.logger.info("Fetching required data")

      const users = this.allUsers

      const onboardingUserPromises =
         users?.map((user) => {
            return this.fetchUserData(user)
         }) || []

      const promises = [
         this.dataLoader.getFutureLivestreams(),
         this.dataLoader.getPastLivestreams(),
      ] as const

      const [futureLivestreams, pastLivestreams] = await Promise.all(promises)

      this.futureLivestreams = futureLivestreams.filter((l) => {
         // filter out livestreams before now, the bundle might have events for the same day
         // already started/ended, also hide the hidden ones
         return l.start.toDate().getTime() > Date.now() && !l.hidden
      })

      this.pastLivestreams = pastLivestreams

      this.onboardingUsers = await Promise.all(onboardingUserPromises)

      await this.generateRecommendations()
      this.logger.info(
         `Fetched ${this.onboardingUsers.length} subscribed users and generated Recommendations`
      )
   }

   async sendDiscoveryEmails() {
      await this.emailBuilder.sendAll()
      await this.createDiscoveryEmailNotifications()
   }

   /**
    * Builds the onboarding discovery lists, mapping each user to the most relevant guidance content. After having the users
    * split into the separate discoveries, use @class OnboardingNewsletterEmailBuilder for adding recipients to the correct templates.
    */
   buildDiscoveryLists() {
      this.logger.info(
         "Building discovery lists & email notification template data"
      )
      this.onboardingUsers.forEach((user) => {
         return this.handleUserDiscovery(user)
      })
      const userDataMapper = (user: OnboardingUserData) => user.user

      this.emailBuilder.setDiscoveryMapper(
         OnboardingNewsletterEvents.LIVESTREAM_1ST_REGISTRATION_DISCOVERY,
         (userData) => {
            return this.livestreamDiscoveryMapper(userData)
         }
      )

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

   /**
    * Maps a user to a livestream discovery template model. This method exists mainly due to the recommended events being specific to each user
    * and that data is kept in this service.
    * @param user UserData for fields
    * @returns LivestreamDiscoveryData Discovery template
    */
   private livestreamDiscoveryMapper(user: UserData): LivestreamDiscoveryData {
      return {
         TemplateId: Number(
            process.env
               .POSTMARK_TEMPLATE_ONBOARDING_NEWSLETTER_LIVESTREAM_1ST_REGISTRATION_DISCOVERY
         ),
         TemplateModel: {
            user_name: user.firstName,
            recommendedEvents: this.userRecommendedLivestreams[user.id].map(
               (event) => this.mapLivestreamToTemplate(event)
            ),
         },
         MessageStream: process.env.POSTMARK_BROADCAST_STREAM,
         Tag: "onboarding-livestream",
      }
   }
}
