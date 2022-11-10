import useCollection from "./useCollection"
import { useMemo } from "react"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { livestreamRepo } from "../../data/RepositoryInstances"
import { LivestreamsDataParser } from "@careerfairy/shared-lib/dist/livestreams/LivestreamRepository"

type Props = {
   filterByGroupId?: string
   languagesIds?: string[]
   interestsIds?: string[]
   jobCheck?: boolean
}

const useListenToUpcomingStreams = (props?: Props) => {
   const { filterByGroupId, languagesIds, interestsIds, jobCheck } = props

   const upcomingEventsQuery = useMemo(() => {
      let query = livestreamRepo.upcomingEventsQuery(!!filterByGroupId)

      if (filterByGroupId) {
         query = query.where("groupIds", "array-contains", filterByGroupId)
      }

      if (languagesIds) {
         query = query.where("language.code", "in", languagesIds)
      }

      if (interestsIds) {
         query = query.where("interestsIds", "array-contains-any", interestsIds)
      }

      return query
   }, [filterByGroupId, interestsIds, languagesIds])

   let { data, isLoading } = useCollection<LivestreamEvent>(
      upcomingEventsQuery,
      true
   )

   if (isLoading) return undefined

   let res = new LivestreamsDataParser(data).filterByNotEndedEvents()

   if (jobCheck) {
      res = res.filterByHasJobs()
   }

   return res.complementaryFields().get()
}

export default useListenToUpcomingStreams
