import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { useCallback, useEffect, useMemo, useState } from "react"
import ExistingDataRecommendationService from "@careerfairy/shared-lib/recommendation/ExistingDataRecommendationService"
import { UserData, UserStats } from "@careerfairy/shared-lib/users"
import { errorLogAndNotify } from "../../../../util/CommonUtil"
import { rewardService } from "../../../../data/firebase/RewardService"

export type UseContent = {
   pastLivestreams: LivestreamEvent[]
   upcomingLivestreams: LivestreamEvent[]
   registeredRecordedLivestreamsForUser: LivestreamEvent[]
}

export type Content = {
   loadingContent: boolean
   content: LivestreamEvent[]
}
const useContent = (
   options: UseContent
): { loadingContent: boolean; content: LivestreamEvent[] } => {
   const { userData, userStats } = useAuth()
   const numberOfCredits = userData?.credits ?? 0

   const pastStreams = useMemo(() => {
      return filterStreamsForUnregisteredUsersAndNonBuyers(
         options.pastLivestreams,
         userStats
      )
   }, [options.pastLivestreams, userStats])

   const {
      recommendedLivestreams: recommendedPastLivestreams,
      loading: loadingPast,
   } = useRecommendedStreams(pastStreams, userData)

   const {
      recommendedLivestreams: recommendedUpcomingLivestreams,
      loading: loadingUpcoming,
   } = useRecommendedStreams(options.upcomingLivestreams, userData)

   return useMemo(() => {
      // Scenario selection
      const hasCredits = numberOfCredits > 0
      const numberOfRegisteredRecordings =
         options.registeredRecordedLivestreamsForUser.length ?? 0
      const hasRegisteredRecordings = numberOfRegisteredRecordings > 0

      let contentStreams: LivestreamEvent[] = []
      console.log(
         "-> options.registeredRecordedLivestreamsForUser",
         options.registeredRecordedLivestreamsForUser
      )
      if (hasCredits && !hasRegisteredRecordings) {
         console.log("-> Scenario 1")
         // Scenario 1
         // User has at least 1 credit and no registered live stream recordings to watch
         // Show 3 recommended past live stream recordings and 1 upcoming live stream
         contentStreams = [
            ...recommendedPastLivestreams.slice(0, 3),
            ...recommendedUpcomingLivestreams.slice(0, 1),
         ]
      } else if (hasCredits && hasRegisteredRecordings) {
         console.log("-> Scenario 2")
         // Scenario 2
         // User has at least 1 credit and at least 1 registered live stream recording to watch
         // Show registered recordings, 1 upcoming live stream, and fill the rest with past live stream recordings up to a maximum of 5 cards in the carousel
         contentStreams = [
            ...options.registeredRecordedLivestreamsForUser,
            ...recommendedUpcomingLivestreams.slice(0, 1),
            ...recommendedPastLivestreams.slice(
               0,
               5 - numberOfRegisteredRecordings - 1
            ),
         ]
      } else if (!hasCredits && !hasRegisteredRecordings) {
         console.log("-> Scenario 3")
         // Scenario 3
         // User has 0 credits and no registered live stream recordings to watch
         // Show 1 recommended past live stream recording (to nudge the user to get more credits) and 3 upcoming live streams
         contentStreams = [
            ...recommendedPastLivestreams.slice(0, 1),
            ...recommendedUpcomingLivestreams.slice(0, 3),
         ]
      } else if (!hasCredits && hasRegisteredRecordings) {
         console.log("-> Scenario 4")
         // Scenario 4
         // User has 0 credits and at least 1 registered live stream recording to watch
         // Show registered recordings, 1 past live stream recording (to nudge the user to get more credits), and fill the rest with upcoming live stream recordings up to a maximum of 5 cards in the carousel
         contentStreams = [
            ...options.registeredRecordedLivestreamsForUser,
            ...recommendedPastLivestreams.slice(0, 1),
            ...recommendedUpcomingLivestreams.slice(
               0,
               5 - numberOfRegisteredRecordings - 1
            ),
         ]
      }

      return {
         loadingContent: loadingPast || loadingUpcoming,
         content: contentStreams,
      }
   }, [
      loadingPast,
      loadingUpcoming,
      numberOfCredits,
      options.registeredRecordedLivestreamsForUser,
      recommendedPastLivestreams,
      recommendedUpcomingLivestreams,
   ])
}

const useRecommendedStreams = (
   streams: LivestreamEvent[],
   userData: UserData
): {
   loading: boolean
   recommendedLivestreams: LivestreamEvent[]
} => {
   const [loading, setLoading] = useState(false)
   const [recommendedLivestreams, setRecommendedLivestreams] = useState<
      LivestreamEvent[]
   >([])

   const getRecommendedStreams = useCallback(async () => {
      try {
         setLoading(true)
         const service = ExistingDataRecommendationService.create(
            console,
            userData,
            streams
         )
         const ids = await service.getRecommendations(5)

         const newStreams = ids.map((id) => {
            return streams.find((event) => event.id === id)
         })

         setRecommendedLivestreams(newStreams)
      } catch (e) {
         console.error(e)
         errorLogAndNotify(e, {
            message: "Error getting recommended streams from existing data",
            user: userData,
         })
      } finally {
         setLoading(false)
      }
   }, [userData, streams])

   useEffect(() => {
      void getRecommendedStreams()
   }, [getRecommendedStreams])

   return {
      loading,
      recommendedLivestreams,
   }
}

const filterStreamsForUnregisteredUsersAndNonBuyers = (
   streams: LivestreamEvent[],
   userStats: UserStats
) => {
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

export default useContent
