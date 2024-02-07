import { useAppSelector } from "components/custom-hook/store"
import { useEffect, useState } from "react"
import { audioLevelsSelector } from "store/selectors/streamingAppSelectors"
import { Stream } from "../../types"
import { swapPositions } from "@careerfairy/shared-lib/utils"

/**
 * Sorts the combined streamers based on their audio levels in descending order.
 * This hook utilizes `useStreams` to get the combined streamers and then applies sorting logic.
 *
 * @returns {Array<Stream>} An array of sorted streamers, primarily based on their audio levels.
 */
export const useSortedStreams = (
   streams: Stream[],
   pageSize: number
): Stream[] => {
   const audioLevels = useAppSelector(audioLevelsSelector)
   const [sortedStreams, setSortedStreams] = useState(streams)

   useEffect(() => {
      setSortedStreams((prevSortedStreams) => {
         let newSortedStreams = [...prevSortedStreams]

         // Ensure all current streams are present, adding new ones to the end.
         streams.forEach((stream) => {
            if (!newSortedStreams.find((s) => s.user.uid === stream.user.uid)) {
               newSortedStreams.push(stream)
            }
         })

         // Remove streams that are no longer present
         newSortedStreams = newSortedStreams.filter((s) =>
            streams.find((stream) => stream.user.uid === s.user.uid)
         )

         if (newSortedStreams.length > pageSize) {
            // If the number of streams is greater than the page size, we might need to sort the streams.

            // Find the first currently active speaker outside the first page.
            const activeSpeakerIndex = newSortedStreams.findIndex(
               (stream, index) => {
                  return (
                     index >= pageSize &&
                     audioLevels[stream.user.uid]?.level > 60
                  )
               }
            )

            if (activeSpeakerIndex !== -1) {
               // Find the least recently active speaker in the first page.
               const sortedByLastSpokeAt = newSortedStreams
                  .slice(0, pageSize)
                  .sort((a, b) => {
                     // Sort by last spoke at (most recent to least recent)
                     const lastSpokeAtA =
                        audioLevels[a.user.uid]?.lastSpokeAt || 0
                     const lastSpokeAtB =
                        audioLevels[b.user.uid]?.lastSpokeAt || 0
                     return lastSpokeAtA - lastSpokeAtB
                  })

               // Find the least active speaker on the first page
               const leastActiveSpeakerIndex = sortedByLastSpokeAt.findIndex(
                  (streamer) =>
                     audioLevels[streamer.user.uid]?.lastSpokeAt !== undefined
               )

               // Use swapPositions to swap the most currently active speaker from the second page with the least recently active speaker on the first page.
               newSortedStreams = swapPositions(
                  newSortedStreams,
                  leastActiveSpeakerIndex,
                  activeSpeakerIndex
               )
            }
         }

         return newSortedStreams
      })
   }, [streams, audioLevels, pageSize])

   return sortedStreams
}
