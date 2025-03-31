import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { useUserRecordingProgress } from "components/custom-hook/recordings/useUserRecordingProgress"
import { livestreamRepo } from "data/RepositoryInstances"
import { useAuth } from "HOCs/AuthProvider"
import { useCallback, useEffect, useState } from "react"

const useRecordingProgressTracker = ({
   livestream,
   playing,
}: {
   livestream: LivestreamEvent
   playing: boolean
}) => {
   const { userData } = useAuth()
   const { data: initialProgress } = useUserRecordingProgress(
      livestream?.id,
      userData?.userEmail
   )
   const [currentPercentage, setCurrentPercentage] = useState(0)
   const [lastSecondWatched, setLastSecondWatched] = useState(
      initialProgress?.lastSecondWatched
   )
   const [videoStartPosition, setVideoStartPosition] = useState(
      initialProgress?.lastSecondWatched
   )
   const [duration, setDuration] = useState(0)

   // Calculate duration from timestamps
   useEffect(() => {
      const startTimestamp =
         livestream.startedAt?.toMillis() || livestream.start?.toMillis()
      const endTimestamp = livestream.endedAt?.toMillis()

      if (startTimestamp && endTimestamp) {
         const durationInSeconds = (endTimestamp - startTimestamp) / 1000
         setDuration(durationInSeconds)
      }
   }, [livestream.startedAt, livestream.endedAt, livestream.start])

   // Set initial state when data is loaded
   useEffect(() => {
      if (initialProgress?.lastSecondWatched) {
         setLastSecondWatched(initialProgress.lastSecondWatched)
         setVideoStartPosition(initialProgress.lastSecondWatched)
         const progress = initialProgress.lastSecondWatched / duration
         setCurrentPercentage(progress * 100)
      }
   }, [initialProgress?.lastSecondWatched, duration])

   useEffect(() => {
      if (!playing) {
         setVideoStartPosition(lastSecondWatched)
      }
   }, [lastSecondWatched, playing])

   const onSecondPassed = useCallback(
      (secondsPassed: number) => {
         const progress = secondsPassed / duration
         setCurrentPercentage(progress * 100)
         setLastSecondWatched(secondsPassed)

         // Update last second watched every 10 seconds
         if (Math.round(secondsPassed) % 10 === 0 && userData?.userEmail) {
            livestreamRepo
               .updateUserRecordingStats({
                  livestreamId: livestream.id,
                  userId: userData.userEmail,
                  lastSecondWatched: secondsPassed,
               })
               .catch((error) => {
                  console.error("Error saving progress:", error)
               })
         }

         // Update minutes watched every 60 seconds
         if (Math.round(secondsPassed) % 60 === 0 && userData?.userEmail) {
            livestreamRepo.updateRecordingStats({
               livestreamId: livestream.id,
               livestreamStartDate: livestream.start,
               minutesWatched: 1,
               onlyIncrementMinutes: true,
               userId: userData.userEmail,
               lastSecondWatched: secondsPassed,
            })
         }
      },
      [livestream.id, livestream.start, duration, userData?.userEmail]
   )

   return {
      currentPercentage,
      lastSecondWatched,
      videoStartPosition,
      onSecondPassed,
   }
}

export default useRecordingProgressTracker
