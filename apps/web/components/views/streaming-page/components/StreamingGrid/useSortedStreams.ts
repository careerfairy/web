import { useRemoteUsers } from "agora-rtc-react"
import { useAppSelector } from "components/custom-hook/store"
import { useMemo } from "react"
import { audioLevelsSelector } from "store/selectors/streamingAppSelectors"
import { useLocalTracks } from "../../context"
import { LocalUser, RemoteUser } from "../../types"

/**
 * Basic implementation of sorting algorithm
 * TODO: Only relocate user when not in the first screen of the grid, eg when the user is in the first screen, don't relocate it.
 *       Screen size can be gotten from layout rows * columns
 * TODO: Don't sort the entire array only SWAP with inactive users on the first screen.
 *       Can be achieved by comparing previous and current state with usePrevious from react use
 *
 */
export const useSortedStreams = (): (LocalUser | RemoteUser)[] => {
   const remoteStreamers = useRemoteUsers()

   const audioLevels = useAppSelector(audioLevelsSelector)

   const { localUser } = useLocalTracks()

   return useMemo(() => {
      // Map remoteStreamers to include the 'type' property
      const mappedRemoteStreamers = remoteStreamers.map<RemoteUser>((user) => ({
         user,
         type: "remote" as const,
      }))

      const combinedStreamers: (LocalUser | RemoteUser)[] =
         mappedRemoteStreamers

      if (localUser) {
         combinedStreamers.push(localUser)
      }

      return combinedStreamers.sort((a, b) => {
         const levelA = audioLevels.get(a.user.uid)?.level || 0
         const levelB = audioLevels.get(b.user.uid)?.level || 0
         return levelB - levelA // Sort in descending order
      })
   }, [audioLevels, localUser, remoteStreamers])
}
