import { useRemoteUsers } from "agora-rtc-react"
import { useMemo } from "react"
import { useLocalTracks } from "../../context"
import { RemoteUser, StreamUser } from "../../types"

/**
 * Combines local and remote streamers into a single array.
 * This hook gathers all streamers without sorting them, preparing the data for further processing or display.
 *
 * @returns {Array<StreamUser>} An array of combined local and remote users.
 */
export const useStreams = (): StreamUser[] => {
   const remoteStreamers = useRemoteUsers()
   const { localUser } = useLocalTracks()

   return useMemo(() => {
      // Start by mapping remoteStreamers to include the 'type' property
      const combinedStreamers: StreamUser[] = remoteStreamers.map<RemoteUser>(
         (user) => ({
            user,
            type: "remote" as const,
         })
      )

      if (localUser) {
         combinedStreamers.push(localUser)
      }

      return combinedStreamers
   }, [localUser, remoteStreamers])
}
