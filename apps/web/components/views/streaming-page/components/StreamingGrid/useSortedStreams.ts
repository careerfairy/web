import { useRemoteUsers } from "agora-rtc-react"
import { useAppSelector } from "components/custom-hook/store"
import { useMemo } from "react"
import { audioLevelsSelector } from "store/selectors/streamingAppSelectors"
import { useLocalTracks } from "../../context"
import { LocalUser, RemoteUser } from "../../types"

/**
 * Basic implementation of sorting algorithm
 * TODO: Only relocate user when not in the first screen of the grid, eg when the user is in the first screen, don't relocate it
 * TODO: Don't sort the entire array only SWAP with inactive users on the first screen
 */
export const useSortedStreams = (): (LocalUser | RemoteUser)[] => {
   const remoteStreamers = useRemoteUsers()

   const audioLevels = useAppSelector(audioLevelsSelector)

   const { localUser } = useLocalTracks()

   return useMemo(() => {
      const sortedRemoteStreamers = remoteStreamers.map((user) => ({
         user: user,
         type: "remote" as const,
      }))

      if (localUser) {
         return [...sortedRemoteStreamers, localUser].sort(
            (a, b) =>
               audioLevels.get(a.user.uid)?.level -
               audioLevels.get(b.user.uid)?.level
         )
      }
      return sortedRemoteStreamers
   }, [audioLevels, localUser, remoteStreamers])
}
