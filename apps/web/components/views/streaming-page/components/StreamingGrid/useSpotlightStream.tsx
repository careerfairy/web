import { useMemo } from "react"
import { UserStream } from "../../types"
import {
   useCurrentScreenSharer,
   useIsScreenShareMode,
} from "store/selectors/streamingAppSelectors"

type UseSpotlightStream = {
   /** The user stream that should be currently in the spotlight. */
   spotlightStream: UserStream | null
   /** All other users that are not in the spotlight. */
   otherStreams: UserStream[]
}

/**
 * Hook to determine the spotlight stream from a list of combined streamers.
 * @returns {UseSpotlightStream} An object containing the spotlightStream.
 */
export const useSpotlightStream = (
   combinedStreamers: UserStream[]
): UseSpotlightStream => {
   const currentScreenSharer = useCurrentScreenSharer()
   const isScreenShareMode = useIsScreenShareMode()

   const delayedIsScreenShareMode = useDelayedValue(isScreenShareMode, 200)
   const delayedCurrentScreenSharer = useDelayedValue(currentScreenSharer, 150)

   return useMemo(() => {
      let spotlightStream: UserStream | null = null

      if (delayedIsScreenShareMode) {
         spotlightStream = combinedStreamers.find(
            (stream) => stream.user.uid === delayedCurrentScreenSharer
         )
      }

      // Find all other streams that are not in the spotlight
      const otherStreams = spotlightStream
         ? combinedStreamers.filter(
              (stream) => stream.user.uid !== spotlightStream?.user.uid
           )
         : combinedStreamers

      return { spotlightStream, otherStreams }
   }, [delayedIsScreenShareMode, combinedStreamers, delayedCurrentScreenSharer])
}

import { useState, useEffect } from "react"

/**
 * Custom hook to delay the update of a value.
 * @param value The value to delay.
 * @param delay The delay in milliseconds.
 * @returns The delayed value.
 */
export const useDelayedValue = <T,>(value: T, delay: number): T => {
   const [delayedValue, setDelayedValue] = useState(value)

   useEffect(() => {
      // Set up a timeout to update the delayed value after the specified delay
      const handler = setTimeout(() => {
         setDelayedValue(value)
      }, delay)

      // Clear the timeout if the component unmounts or the value/delay changes
      return () => {
         clearTimeout(handler)
      }
   }, [value, delay]) // Only re-run the effect if value or delay changes

   return delayedValue
}
