import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import ExistingDataRecommendationService from "@careerfairy/shared-lib/recommendation/ExistingDataRecommendationService"
import { IRecommendationService } from "@careerfairy/shared-lib/recommendation/IRecommendationService"
import { UserData, UserStats } from "@careerfairy/shared-lib/users"
import DateUtil from "util/DateUtil"
import { mapFromServerSide } from "util/serverUtil"
import { rewardService } from "../../../../data/firebase/RewardService"
import { firebaseServiceInstance } from "data/firebase/FirebaseService"
import { sparkService } from "data/firebase/SparksService"

export type GetContentOptions = {
   pastLivestreams: LivestreamEvent[]
   upcomingLivestreams: LivestreamEvent[]
   registeredRecordedLivestreamsForUser: LivestreamEvent[]
   userData?: UserData
   userStats?: UserStats
}

export type LivestreamEventWithType = LivestreamEvent & {
   contentType: "LivestreamEvent"
}

export type CTASlideTopic = "CareerCoins" | "Sparks"
export type CTASlide = {
   contentType: "CTASlide"
   topic: CTASlideTopic
}
export const MAX_CTA_DISPLAY_COUNT = 5

export type CarouselContent = CTASlide | LivestreamEventWithType
export type SerializedContent =
   | CTASlide
   | ({ [field: string]: any } & { contentType: "LivestreamEvent" })

/**
 *
 * A service that provides a list of recommended livestream events for a carousel UI,
 * based on the user's past activity and options passed as arguments.
 *  @class
 * @param {Object} options - An object containing various options to be used for getting
 * carousel content. The object should have the following format:
 *   {
 *   pastLivestreams: LivestreamEvent[],
 *   upcomingLivestreams: LivestreamEvent[],
 *   registeredRecordedLivestreamsForUser: LivestreamEvent[],
 *   userData?: UserData,
 *   userStats?: UserStats
 *   }
 *   - pastLivestreams: An array of past livestream events
 *   - upcomingLivestreams: An array of upcoming livestream events
 *   - registeredRecordedLivestreamsForUser: An array of recorded livestream events that the user has registered for
 *   - userData: The user's data
 *   - userStats: The user's stats
 *   @returns {Promise<LivestreamEvent[]>} - A promise that resolves to an array of recommended livestream events
 *   */
export class CarouselContentService {
   private options: GetContentOptions
   private readonly pastEventsService: IRecommendationService
   private readonly upcomingEventsService: IRecommendationService

   constructor(options: GetContentOptions) {
      this.options = options
      this.pastEventsService = ExistingDataRecommendationService.create(
         console,
         options.userData,
         filterStreamsForUnregisteredUsersAndNonBuyers(
            options.pastLivestreams,
            options.userStats
         )
      )
      this.upcomingEventsService = ExistingDataRecommendationService.create(
         console,
         options.userData,
         filterNonRegisteredStreams(
            options.upcomingLivestreams,
            options.userStats
         )
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

      // check whether to add Credits CTA
      const shouldSeeCreditsCTABanner = userShouldSeeCTABannerToday(
         this.options.userData,
         "CareerCoins"
      )

      // If the user has not bought a recording, add slide before the content
      if (!this.userHasBoughtRecording() && shouldSeeCreditsCTABanner) {
         content = [
            {
               contentType: "CTASlide",
               topic: "CareerCoins",
            },
            ...content,
         ]
      }

      // check whether to add Sparks CTA
      const shouldSeeSparksCTABanner = userShouldSeeCTABannerToday(
         this.options.userData,
         "Sparks"
      )
      const userHasSeenASpark = await this.userHasSeenASpark()
      if (!userHasSeenASpark && shouldSeeSparksCTABanner) {
         content = [
            {
               contentType: "CTASlide",
               topic: "Sparks",
            },
            ...content,
         ]
      }

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
      if (userId) {
         return await sparkService.hasUserSeenAnySpark(userId)
      } else {
         return false
      }
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
               case "CareerCoins": {
                  userDates = userData.creditsBannerCTADates
                  break
               }
               case "Sparks": {
                  userDates = userData.sparksBannerCTADates
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
               case "CareerCoins": {
                  addDatePromise =
                     firebaseServiceInstance.addDateUserHasSeenCreditsCTABanner(
                        userData.userEmail
                     )
                  break
               }
               case "Sparks": {
                  addDatePromise =
                     firebaseServiceInstance.addDateUserHasSeenSparksCTABanner(
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

const filterStreamsForUnregisteredUsersAndNonBuyers = (
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

      const hasRegistered = s.registeredUsers?.includes(userStats?.userId ?? "")
      // We only want to show past streams that are recorded and the user has not bought the recording
      // and the user has not registered for the livestream
      return allowedToWatchRecording && !hasRegistered && !hasBoughtRecording
   })
}

export const filterNonRegisteredStreams = (
   streams: LivestreamEvent[],
   userStats: UserStats
) => {
   if (!streams.length) {
      return []
   }
   return streams.filter((s) => {
      const hasRegistered = s.registeredUsers?.includes(userStats?.userId ?? "")
      return !hasRegistered
   })
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
         case "CareerCoins": {
            bannerCTADates = userData.creditsBannerCTADates
            break
         }
         case "Sparks": {
            bannerCTADates = userData.sparksBannerCTADates
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
