import useCollection from "./useCollection"
import { useMemo } from "react"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { livestreamRepo } from "../../data/RepositoryInstances"
import { LivestreamsDataParser } from "@careerfairy/shared-lib/dist/livestreams/LivestreamRepository"

const useListenToUpcomingStreams = (filterByGroupId?: string) => {
   const upcomingEventsQuery = useMemo(() => {
      let query = livestreamRepo.upcomingEventsQuery(!!filterByGroupId)

      if (filterByGroupId) {
         query = query.where("groupIds", "array-contains", filterByGroupId)
      }

      return query
   }, [filterByGroupId])

   let { data, isLoading } = useCollection<LivestreamEvent>(
      upcomingEventsQuery,
      true
   )

   if (isLoading) return undefined

   let res = new LivestreamsDataParser(data).filterByNotEndedEvents()

   return res.complementaryFields().get()
}

export default useListenToUpcomingStreams
