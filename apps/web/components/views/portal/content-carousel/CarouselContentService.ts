import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import ExistingDataRecommendationService from "@careerfairy/shared-lib/recommendation/ExistingDataRecommendationService"
import { IRecommendationService } from "@careerfairy/shared-lib/recommendation/IRecommendationService"
import { UserData, UserStats } from "@careerfairy/shared-lib/users"
import { mapFromServerSide } from "util/serverUtil"
import { rewardService } from "../../../../data/firebase/RewardService"
import DateUtil from "util/DateUtil"

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
export type CTASlide = {
   contentType: "CTASlide"
   // other fields
}

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
      const shouldSeeCreditsCTABanner = userShouldSeeCreditsCTABannerToday(
         this.options.userData
      )

      // If the user has not bought the recording, add a CTASlide before the content
      if (!this.userHasBoughtRecording() && shouldSeeCreditsCTABanner) {
         content = [
            {
               contentType: "CTASlide",
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

const MAX_CREDITS_CTA_DISPLAY_COUNT = 5

/**
 * Determines whether the user should see the 'Buy Credits' CTA banner today.
 *
 * This function checks if the day is different from the last day the banner was displayed,
 * and also checks that the number of times the banner has been displayed is less than
 * the maximum allowed count.
 *
 * @param {UserData} userData - The user's data, including information about last display and count of banner displays.
 * @returns {boolean} - Returns true if the user should see the banner today, false otherwise.
 */
export const userShouldSeeCreditsCTABannerToday = (
   userData: UserData
): boolean => {
   const creditsBannerCTADates = userData?.creditsBannerCTADates || []
   const today = DateUtil.formatDateToString(new Date()) // formatDate should return a string formatted as "dd/mm/yyyy"

   return (
      !creditsBannerCTADates.includes(today) &&
      creditsBannerCTADates.length < MAX_CREDITS_CTA_DISPLAY_COUNT
   )
}

export default CarouselContentService
