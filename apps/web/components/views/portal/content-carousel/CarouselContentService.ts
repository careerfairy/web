import { CustomJobApplicant } from "@careerfairy/shared-lib/customJobs/customJobs"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import ExistingDataRecommendationService from "@careerfairy/shared-lib/recommendation/livestreams/ExistingDataRecommendationService"
import { IRecommendationService } from "@careerfairy/shared-lib/recommendation/livestreams/IRecommendationService"
import { ImplicitLivestreamRecommendationData } from "@careerfairy/shared-lib/recommendation/livestreams/ImplicitLivestreamRecommendationData"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import {
   CompanyFollowed,
   UserData,
   UserStats,
} from "@careerfairy/shared-lib/users"
import { firebaseServiceInstance } from "data/firebase/FirebaseService"
import { livestreamService } from "data/firebase/LivestreamService"
import { sparkService } from "data/firebase/SparksService"
import DateUtil from "util/DateUtil"
import { mapFromServerSide } from "util/serverUtil"
import { rewardService } from "../../../../data/firebase/RewardService"

export type GetContentOptions = {
   pastLivestreams: LivestreamEvent[]
   upcomingLivestreams: LivestreamEvent[]
   registeredRecordedLivestreamsForUser: LivestreamEvent[]
   userData?: UserData
   userStats?: UserStats
   watchedLivestreams?: LivestreamEvent[]
   watchedSparks?: Spark[]
   appliedJobs?: CustomJobApplicant[]
   followedCompanies?: CompanyFollowed[]
}

export type LivestreamEventWithType = LivestreamEvent & {
   contentType: "LivestreamEvent"
}

export const CTASlideTopics = {
   CareerCoins: "CareerCoins",
   Sparks: "Sparks",
   Jobs: "Jobs",
   Mobile: "Mobile",
} as const

export type CTASlideTopic = (typeof CTASlideTopics)[keyof typeof CTASlideTopics]

export type CTASlide = {
   contentType: "CTASlide"
   topic: CTASlideTopic
}
export const MAX_CTA_DISPLAY_COUNT = 5

export type CarouselContent = CTASlide | LivestreamEventWithType
export type SerializedContent =
   | CTASlide
   | ({ [field: string]: unknown } & { contentType: "LivestreamEvent" })

/**
 *
 * A service that provides a list of recommended live stream events for a carousel UI,
 * based on the user's past activity and options passed as arguments.
 *  @class
 * @param {Object} options - An object containing various options to be used for getting
 * carousel content. The object should have the following format:
 *   {
 *   pastLivestreams: LivestreamEvent[],
 *   upcomingLivestreams: LivestreamEvent[],
 *   registeredRecordedLivestreamsForUser: LivestreamEvent[],
 *   userData?: UserData,
 *   userStats?: UserStats,
 *   watchedLivestreams?: LivestreamEvent[],
 *   watchedSparks?: Spark[],
 *   appliedJobs?: CustomJobApplicant[]
 *   followedCompanies?: CompanyFollowed[]
 *   }
 *   - pastLivestreams: An array of past live stream events
 *   - upcomingLivestreams: An array of upcoming live stream events
 *   - registeredRecordedLivestreamsForUser: An array of recorded live stream events that the user has registered for
 *   - userData: The user's data
 *   - userStats: The user's stats
 *   - watchedLivestreams: The user's latest watched live streams, including recordings
 *   - watchedSparks: The user's latest watched sparks
 *   - appliedJobs: The user's latest applied jobs
 *   - followedCompanies: The companies the user currently follows
 *   @returns {Promise<LivestreamEvent[]>} - A promise that resolves to an array of recommended live stream events
 *   */
export class CarouselContentService {
   private options: GetContentOptions
   private readonly pastEventsService: IRecommendationService
   private readonly upcomingEventsService: IRecommendationService

   constructor(options: GetContentOptions) {
      this.options = options
      const implicitRecommendationData: ImplicitLivestreamRecommendationData = {
         watchedLivestreams: options.watchedLivestreams,
         watchedSparks: options.watchedSparks,
         appliedJobs: options.appliedJobs,
         followedCompanies: options.followedCompanies,
      }

      this.pastEventsService = ExistingDataRecommendationService.create(
         console,
         options.userData,
         filterStreamsForNonBuyers(options.pastLivestreams, options.userStats),
         false,
         implicitRecommendationData
      )
      this.upcomingEventsService = ExistingDataRecommendationService.create(
         console,
         options.userData,
         options.upcomingLivestreams,
         false,
         implicitRecommendationData
      )
   }

   public async getCarouselContent(): Promise<CarouselContent[]> {
      const [recommendedPastLivestreams, recommendedUpcomingLivestreams] =
         await Promise.all([
            this.getRecommendedStreams(
               this.pastEventsService,
               this.options.pastLivestreams
            ),
            this.getRecommendedStreams(
               this.upcomingEventsService,
               this.options.upcomingLivestreams
            ),
         ])

      const numberOfCredits = this.options.userData?.credits ?? 0

      // Scenario selection
      const hasCredits = numberOfCredits > 0

      const numberOfRegisteredRecordings =
         this.options.registeredRecordedLivestreamsForUser.length ?? 0
      const hasRegisteredRecordings = numberOfRegisteredRecordings > 0

      let contentStreams: LivestreamEvent[] = []

      if (hasCredits && !hasRegisteredRecordings) {
         /*
          * Scenario 1
          * User has at least 1 credit and no registered live stream recordings to watch
          * Show 3 recommended past live stream recordings and 1 upcoming live stream
          * */
         contentStreams = [
            ...recommendedPastLivestreams.slice(0, 3),
            ...recommendedUpcomingLivestreams.slice(0, 1),
         ]
      } else if (hasCredits && hasRegisteredRecordings) {
         /*
          * Scenario 2
          * User has at least 1 credit and at least 1 registered live stream recording to watch
          * Show registered recordings, 1 upcoming live stream, and fill the rest with past live stream recordings up to a maximum of 5 cards in the carousel
          * */
         contentStreams = [
            ...this.options.registeredRecordedLivestreamsForUser,
            ...recommendedUpcomingLivestreams.slice(0, 1),
            ...recommendedPastLivestreams.slice(
               0,
               recommendedPastLivestreams.length - 1
            ),
         ]
      } else if (!hasCredits && !hasRegisteredRecordings) {
         /*
          * Scenario 3
          * User has 0 credits and no registered live stream recordings to watch
          * Show 1 recommended past live stream recording (to nudge the user to get more credits) and 3 upcoming live streams
          * */
         contentStreams = [
            ...recommendedPastLivestreams.slice(0, 1),
            ...recommendedUpcomingLivestreams.slice(0, 3),
         ]
      } else if (!hasCredits && hasRegisteredRecordings) {
         /*
          * Scenario 4
          * User has 0 credits and at least 1 registered live stream recording to watch
          * Show registered recordings, 1 past live stream recording (to nudge the user to get more credits), and fill the rest with upcoming live stream recordings up to a maximum of 5 cards in the carousel
          * */
         contentStreams = [
            ...this.options.registeredRecordedLivestreamsForUser,
            ...recommendedPastLivestreams.slice(0, 1),
            ...recommendedUpcomingLivestreams.slice(
               0,
               recommendedUpcomingLivestreams.length - 1
            ),
         ]
      }

      let content: CarouselContent[] = contentStreams.map((stream) => {
         return {
            ...stream,
            contentType: "LivestreamEvent",
         }
      })

      // check whether to add Sparks CTA
      const shouldSeeSparksCTABanner = userShouldSeeCTABannerToday(
         this.options.userData,
         CTASlideTopics.Sparks
      )

      const [userHasSeenASpark, userHasAppliedToAJob] = await Promise.all([
         this.userHasSeenASpark(),
         this.userHasAppliedToAJob(),
      ])

      if (!userHasSeenASpark && shouldSeeSparksCTABanner) {
         content = [
            {
               contentType: "CTASlide",
               topic: CTASlideTopics.Sparks,
            },
            ...content,
         ]
      }

      // check whether to add Jobs CTA
      const shouldSeeJobsCTABanner = userShouldSeeCTABannerToday(
         this.options.userData,
         CTASlideTopics.Jobs
      )

      if (!userHasAppliedToAJob && shouldSeeJobsCTABanner) {
         content = [
            {
               contentType: "CTASlide",
               topic: CTASlideTopics.Jobs,
            },
            ...content,
         ]
      }

      content = [
         {
            contentType: "CTASlide",
            topic: CTASlideTopics.Mobile,
         },
         ...content
      ]

      return content
   }

   private async getRecommendedStreams(
      service: IRecommendationService,
      livestreams: LivestreamEvent[]
   ): Promise<LivestreamEvent[]> {
      const ids = await service.getRecommendations(5)

      return ids.map((id) => {
         return livestreams.find((event) => event.id === id)
      })
   }

   private userHasBoughtRecording(): boolean {
      return Boolean(this.options.userStats?.recordingsBought?.length)
   }

   private async userHasSeenASpark(): Promise<boolean> {
      const userId = this.options.userData?.authId
      return userId ? sparkService.hasUserSeenAnySpark(userId) : false
   }

   private async userHasAppliedToAJob(): Promise<boolean> {
      return this.options.userData?.hasJobApplications
   }

   static serializeContent(content: CarouselContent[]): SerializedContent[] {
      return content
         .map((item) => {
            switch (item.contentType) {
               case "LivestreamEvent":
                  return {
                     ...LivestreamPresenter.serializeDocument(item),
                     contentType: "LivestreamEvent" as const,
                  }
               case "CTASlide":
                  return item
               default:
                  return null
            }
         })
         .filter(Boolean)
   }

   static deserializeContent(content: SerializedContent[]): CarouselContent[] {
      return content
         .map((item) => {
            switch (item.contentType) {
               case "LivestreamEvent":
                  // eslint-disable-next-line no-case-declarations
                  const stream = mapFromServerSide([item])[0]
                  return {
                     ...stream,
                     contentType: "LivestreamEvent" as const,
                  }
               case "CTASlide":
                  return item
               default:
                  return null
            }
         })
         .filter(Boolean)
   }

   static incrementCTABannerViewCount(
      inView: boolean,
      userData: UserData,
      bannerType: CTASlideTopic
   ) {
      if (inView) {
         let userDates
         if (userData) {
            switch (bannerType) {
               case CTASlideTopics.CareerCoins: {
                  userDates = userData.creditsBannerCTADates
                  break
               }
               case CTASlideTopics.Sparks: {
                  userDates = userData.sparksBannerCTADates
                  break
               }
               case CTASlideTopics.Jobs: {
                  userDates = userData.jobsBannerCTADates
                  break
               }
            }
         }
         userDates = userDates ? userDates : []
         const today = DateUtil.formatDateToString(new Date())

         const shouldIncrementBannerDisplayCount =
            // Only increment if user hasn't seen the banner today
            !userDates.includes(today) &&
            // Only increment if user hasn't seen the banner 5 times
            userDates.length < MAX_CTA_DISPLAY_COUNT

         if (shouldIncrementBannerDisplayCount) {
            let addDatePromise: Promise<void>
            switch (bannerType) {
               case CTASlideTopics.CareerCoins: {
                  addDatePromise =
                     firebaseServiceInstance.addDateUserHasSeenCreditsCTABanner(
                        userData.userEmail
                     )
                  break
               }
               case CTASlideTopics.Sparks: {
                  addDatePromise =
                     firebaseServiceInstance.addDateUserHasSeenSparksCTABanner(
                        userData.userEmail
                     )
                  break
               }
               case CTASlideTopics.Jobs: {
                  addDatePromise =
                     firebaseServiceInstance.addDateUserHasSeenJobsCTABanner(
                        userData.userEmail
                     )
                  break
               }
            }
            addDatePromise.catch(console.error)
         }
      }
   }
}

const filterStreamsForNonBuyers = (
   streams: LivestreamEvent[],
   userStats: UserStats
) => {
   if (!streams.length) {
      return []
   }

   return streams.filter((s) => {
      const hasBoughtRecording = rewardService.canAccessRecording(
         userStats,
         s.id
      )
      const allowedToWatchRecording = Boolean(s.denyRecordingAccess) === false

      // We only want to show past streams that are recorded and the user has not bought the recording
      return allowedToWatchRecording && !hasBoughtRecording
   })
}

/**
 * Filters out live streams that the user has already registered for.
 *
 * @param {LivestreamEvent[]} streams - An array of LivestreamEvent objects to filter.
 * @param {string} userId - The ID of the user to check registrations against.
 * @returns {Promise<LivestreamEvent[]>} A promise that resolves to an array of LivestreamEvent objects,
 *                                       excluding those the user has already registered for.
 */
export const filterNonRegisteredStreams = async (
   streams: LivestreamEvent[],
   userId: string
): Promise<LivestreamEvent[]> => {
   const registrationStatus = await Promise.all(
      streams.map((stream) =>
         livestreamService.hasUserRegistered(stream.id, userId)
      )
   )
   return streams.filter((_, index) => !registrationStatus[index])
}

/**
 * Determines whether the user should see the given CTA (Call-to-Action) banner today.
 *
 * @param {UserData} userData - The user data containing the credits banner CTA dates.
 * @returns {boolean} - `true` if the user should see the credits CTA banner today, `false` otherwise.
 */
const userShouldSeeCTABannerToday = (
   userData: UserData,
   bannerType: CTASlideTopic
): boolean => {
   let bannerCTADates
   if (userData) {
      switch (bannerType) {
         case CTASlideTopics.CareerCoins: {
            bannerCTADates = userData.creditsBannerCTADates
            break
         }
         case CTASlideTopics.Sparks: {
            bannerCTADates = userData.sparksBannerCTADates
            break
         }
         case CTASlideTopics.Jobs: {
            bannerCTADates = userData.jobsBannerCTADates
            break
         }
      }
   }
   bannerCTADates = bannerCTADates ? bannerCTADates : []
   const today = DateUtil.formatDateToString(new Date()) // formatDate should return a string formatted as "dd/mm/yyyy"

   const numberOfTimesBannerDisplayed = bannerCTADates.length

   const isBelowMaxDisplayCount =
      numberOfTimesBannerDisplayed < MAX_CTA_DISPLAY_COUNT

   const todayIsTheLastDisplayDate =
      bannerCTADates.includes(today) &&
      numberOfTimesBannerDisplayed === MAX_CTA_DISPLAY_COUNT

   return isBelowMaxDisplayCount || todayIsTheLastDisplayDate
}

export default CarouselContentService
