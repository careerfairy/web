import { useRemoteUsers } from "agora-rtc-react"
import { useMemo } from "react"
import { useLocalTracks } from "../../context"
import { RemoteUser, StreamUser } from "../../types"
import { useScreenShareTracks } from "../../context/ScreenShareTracks"
import { STREAM_IDENTIFIERS } from "constants/streaming"

/**
 * Combines local and remote streamers into a single array.
 * This hook gathers all streamers without sorting them, preparing the data for further processing or display.
 *
 * @returns {Array<StreamUser>} An array of combined local and remote users.
 */
export const useStreams = (): StreamUser[] => {
   const remoteStreamers = useRemoteUsers()

   const { localUser } = useLocalTracks()
   const { localUserScreen, screenShareUID } = useScreenShareTracks()

   return useMemo(() => {
      // Start by mapping remoteStreamers to include the 'type' property
      const combinedStreamers: StreamUser[] = remoteStreamers
         .filter((user) => user.uid !== screenShareUID) // Agora rule: User should never subscribe to their own local screen share
         .map<RemoteUser>((user) => ({
            user,
            type: user.uid
               .toString()
               .startsWith(STREAM_IDENTIFIERS.SCREEN_SHARE)
               ? "remote-user-screen"
               : "remote-user",
         }))

      if (localUser) {
         combinedStreamers.push(localUser)
      }

      if (localUserScreen) {
         combinedStreamers.push(localUserScreen)
      }

      return combinedStreamers
   }, [localUser, localUserScreen, remoteStreamers, screenShareUID])
}
