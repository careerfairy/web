import { useRemoteUsers } from "agora-rtc-react"
import { useMemo } from "react"
import { useLocalTracks } from "../../context"
import { RemoteUser, Stream } from "../../types"

/**
 * Combines local and remote streamers into a single array.
 * This hook gathers all streamers without sorting them, preparing the data for further processing or display.
 *
 * @returns {Array<Stream>} An array of combined local and remote users.
 */
export const useStreams = (): Stream[] => {
   const remoteStreamers = useRemoteUsers()
   const { localUser } = useLocalTracks()

   return useMemo(() => {
      // Map remoteStreamers to include the 'type' property
      const mappedRemoteStreamers = remoteStreamers.map<RemoteUser>((user) => ({
         user,
         type: "remote" as const,
      }))

      const combinedStreamers: Stream[] = mappedRemoteStreamers

      if (localUser) {
         combinedStreamers.push(localUser)
      }

      return combinedStreamers
   }, [localUser, remoteStreamers])
}
