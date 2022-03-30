import useCollection from "./useCollection"
import { LiveStreamEvent } from "../../types/event"
import livestreamRepo, {
   LivestreamsDataParser,
} from "../../data/firebase/LivestreamRepository"
import { useMemo } from "react"

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

   let { data, isLoading } = useCollection<LiveStreamEvent>(
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
