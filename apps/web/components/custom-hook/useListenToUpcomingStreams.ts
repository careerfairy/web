import useCollection from "./useCollection"
import livestreamRepo, {
   LivestreamsDataParser,
} from "../../data/firebase/LivestreamRepository"
import { useMemo } from "react"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"

const useListenToUpcomingStreams = (
   filterByGroupId?: string,
   selectedCategories?: string[]
) => {
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

   if (filterByGroupId && selectedCategories) {
      res = res.filterByTargetCategories(filterByGroupId, selectedCategories)
   }

   return res.complementaryFields().get()
}

export default useListenToUpcomingStreams
