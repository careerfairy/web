import { useRemoteUsers } from "agora-rtc-react"
import { useMemo } from "react"
import { useLocalTracks } from "../../context"
import { RemoteUser, UserStream } from "../../types"
import { useScreenShare } from "../../context/ScreenShareTracks"
import { STREAM_IDENTIFIERS } from "constants/streaming"

/**
 * Combines local and remote streamers into a single array.
 * This hook gathers all streamers without sorting them, preparing the data for further processing or display.
 *
 * @returns {Array<UserStream>} An array of combined local and remote users.
 */
export const useStreams = (): UserStream[] => {
   const remoteStreamers = useRemoteUsers()

   const { localUser, readyToPublish: readyToPublishLocalUser } =
      useLocalTracks()

   const {
      localUserScreen,
      screenShareUID,
      readyToPublish: readyToPublishScreenShare,
   } = useScreenShare()

   return useMemo(() => {
      // Start by mapping remoteStreamers to include the 'type' property
      const combinedStreamers: UserStream[] = remoteStreamers
         .filter((user) => user.uid !== screenShareUID) // Agora rule: User should never subscribe to their own local screen share
         .map<RemoteUser>((user) => ({
            user,
            type: user.uid
               .toString()
               .startsWith(STREAM_IDENTIFIERS.SCREEN_SHARE)
               ? "remote-user-screen"
               : "remote-user",
         }))

      if (readyToPublishLocalUser) {
         combinedStreamers.push(localUser)
      }

      if (readyToPublishScreenShare) {
         combinedStreamers.push(localUserScreen)
      }

      return combinedStreamers
   }, [
      localUser,
      localUserScreen,
      readyToPublishLocalUser,
      readyToPublishScreenShare,
      remoteStreamers,
      screenShareUID,
   ])
}
