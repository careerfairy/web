import { useAppSelector } from "components/custom-hook/store"
import { useEffect, useState } from "react"
import { audioLevelsSelector } from "store/selectors/streamingAppSelectors"
import { StreamUser } from "../../types"
import { swapPositions } from "@careerfairy/shared-lib/utils"

/**
 * Sorts the combined streamers based on their audio levels in descending order.
 * This hook utilizes `useStreams` to get the combined streamers and then applies sorting logic.
 *
 * @returns {Array<StreamUser>} An array of sorted streamers, primarily based on their audio levels.
 */
export const useSortedStreams = (
   streams: StreamUser[],
   pageSize: number
): StreamUser[] => {
   const audioLevels = useAppSelector(audioLevelsSelector)
   const [sortedStreams, setSortedStreams] = useState(streams)

   useEffect(() => {
      setSortedStreams((prevSortedStreams) => {
         // update the streams with the latest stream data
         let newSortedStreams = prevSortedStreams.map(
            (s) =>
               streams.find((stream) => stream.user.uid === s.user.uid) || null
         )

         // Remove streams that are no longer present
         newSortedStreams = newSortedStreams.filter(Boolean)

         // Ensure all current streams are present, adding new ones to the end.
         streams.forEach((stream) => {
            const isStreamPresent = newSortedStreams.some(
               (s) => s.user.uid === stream.user.uid
            )
            if (!isStreamPresent) {
               newSortedStreams.push(stream)
            }
         })

         if (newSortedStreams.length > pageSize) {
            // Only sort the streams if the number of streams is greater than the page size.

            // Find the first currently active speaker outside the first page.
            const firstActiveSpeakerIndex = newSortedStreams.findIndex(
               (stream, index) => {
                  return (
                     index >= pageSize &&
                     audioLevels[stream.user.uid]?.level > 60
                  )
               }
            )

            if (firstActiveSpeakerIndex !== -1) {
               // Find the least recently active speaker in the entire array or default to the first one
               const leastActiveSpeakerIndex = newSortedStreams.reduce(
                  (leastActiveIndex, currentStream, currentIndex) => {
                     if (currentIndex >= pageSize) return leastActiveIndex // Only consider the first page

                     const currentLastSpokeAt =
                        audioLevels[currentStream.user.uid]?.lastSpokeAt || 0
                     const leastActiveLastSpokeAt =
                        audioLevels[newSortedStreams[leastActiveIndex].user.uid]
                           ?.lastSpokeAt || 0

                     // Update the leastActiveIndex if the current stream's lastSpokeAt is earlier
                     return currentLastSpokeAt < leastActiveLastSpokeAt ||
                        leastActiveLastSpokeAt === 0
                        ? currentIndex
                        : leastActiveIndex
                  },
                  0
               )

               // Use swapPositions to swap the most currently active speaker from the second page with the least recently active speaker on the first page.
               newSortedStreams = swapPositions(
                  newSortedStreams,
                  leastActiveSpeakerIndex,
                  firstActiveSpeakerIndex
               )
            }
         }

         return newSortedStreams
      })
   }, [streams, audioLevels, pageSize])

   return sortedStreams
}
