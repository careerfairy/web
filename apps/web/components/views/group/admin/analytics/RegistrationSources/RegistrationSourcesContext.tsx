import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "../../../../../custom-hook/utils/useFunctionsSWRFetcher"
import { Job } from "@careerfairy/shared-lib/dist/ats/Job"
import useSWR from "swr"
import { createContext, ReactElement, useContext, useMemo } from "react"
import { RegistrationSourcesResponseItem } from "@careerfairy/shared-lib/dist/functions/groupAnalyticsTypes"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { Group } from "@careerfairy/shared-lib/dist/groups"
import { sortLivestreamsDesc } from "@careerfairy/shared-lib/dist/utils"
import { fixLivestreamRegistrationDates } from "@careerfairy/shared-lib/livestreams/sources/transformations"

type IRegistrationSourcesContext = {
   utmData?: RegistrationSourcesResponseItem[]
   // selected livestreams (top right filter)
   livestreams: LivestreamEvent[]
}

export const RegistrationSourcesContext =
   createContext<IRegistrationSourcesContext>(null)

type Props = {
   group: Group
   streamsFromTimeFrameAndFuture: LivestreamEvent[]
   children: ReactElement
}

/**
 * All the UTM data stored on this context provider
 */
const RegistrationSourcesProvider = ({
   children,
   group,
   streamsFromTimeFrameAndFuture,
}: Props) => {
   const livestreamIds = useMemo(() => {
      return streamsFromTimeFrameAndFuture.map((l) => l.id)
   }, [streamsFromTimeFrameAndFuture])

   // fetch slimmed userLivestreamData from the cloud function
   const data = useDataFromFunction(group.id, livestreamIds)

   const values = useMemo(() => {
      const livestreams = [...streamsFromTimeFrameAndFuture].sort(
         sortLivestreamsDesc
      )
      return {
         utmData: fixLivestreamRegistrationDates(data, livestreams),
         livestreams,
      }
   }, [data, streamsFromTimeFrameAndFuture])

   return (
      <RegistrationSourcesContext.Provider value={values}>
         {children}
      </RegistrationSourcesContext.Provider>
   )
}

/**
 * Hook to fetch utm data
 */
const useDataFromFunction = (
   groupId: string,
   livestreamIds: string[]
): RegistrationSourcesResponseItem[] => {
   const fetcher = useFunctionsSWR<RegistrationSourcesResponseItem[]>()

   const { data } = useSWR(
      livestreamIds.length == 0
         ? null
         : [
              "getRegistrationSources_eu",
              {
                 groupId,
                 livestreamIds,
              },
           ],
      fetcher,
      reducedRemoteCallsOptions
   )

   return useMemo(() => {
      // deserialize and convert to type
      return data?.map(RegistrationSourcesResponseItem.deserialize) ?? []
   }, [data])
}

export const useUtmData = () => {
   return useContext<IRegistrationSourcesContext>(RegistrationSourcesContext)
}

export default RegistrationSourcesProvider
