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

   return useMemo(() => {
      let spotlightStream: UserStream | null = null

      if (isScreenShareMode) {
         spotlightStream = combinedStreamers.find(
            (stream) => stream.user.uid === currentScreenSharer
         )
      }

      // Find all other streams that are not in the spotlight
      const otherStreams = spotlightStream
         ? combinedStreamers.filter(
              (stream) => stream.user.uid !== spotlightStream?.user.uid
           )
         : combinedStreamers

      return { spotlightStream, otherStreams }
   }, [combinedStreamers, isScreenShareMode, currentScreenSharer])
}
