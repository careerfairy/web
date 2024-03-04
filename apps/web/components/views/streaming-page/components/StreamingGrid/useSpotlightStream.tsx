import { useMemo } from "react"
import { UserStream } from "../../types"
import {
   useCurrentScreenSharer,
   useIsScreenShareMode,
} from "store/selectors/streamingAppSelectors"

type UseSpotlightStream = {
   /** The user stream that should be currently in the spotlight. */
   spotlightStream: UserStream | null
   /** All other streams that are not in the spotlight. */
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

      const otherStreams = combinedStreamers.filter(
         (stream) =>
            stream.type !== "local-user-screen" && // filter out local user screen share
            stream.type !== "remote-user-screen" && // filter out remote user screen share
            stream.user?.uid !== spotlightStream?.user?.uid // filter out the spotlight stream
      )

      return { spotlightStream, otherStreams }
   }, [isScreenShareMode, combinedStreamers, currentScreenSharer])
}
