import React, { useEffect, useMemo, useState } from "react"
import EventsPreview, { EventsTypes } from "./EventsPreview"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { usePagination } from "use-pagination-firestore"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { livestreamRepo } from "../../../../data/RepositoryInstances"

const RecommendedEvents = ({ limit, maxLimitIncreaseTimes }: Props) => {
   const { authenticatedUser, userData } = useAuth()
   const [currentLimit, setCurrentLimit] = useState(limit)
   const [numLimitIncreases, setNumLimitIncreases] = useState(0)

   const [nonRegisteredRecommendedEvents, setNonRegisteredRecommendedEvents] =
      useState<LivestreamEvent[]>([])

   const query = useMemo(() => {
      return livestreamRepo.recommendEventsQuery(userData?.interestsIds)
   }, [userData?.interestsIds])

   const {
      items: recommendedEvents,
      isLoading,
      isEnd,
   } = usePagination<LivestreamEvent>(userData?.interestsIds && query, {
      limit: currentLimit,
   })

   useEffect(() => {
      if (
         !isEnd &&
         !isLoading &&
         nonRegisteredRecommendedEvents.length < 20 &&
         numLimitIncreases <= maxLimitIncreaseTimes
      ) {
         increaseLimit()
      }
   }, [
      isLoading,
      maxLimitIncreaseTimes,
      nonRegisteredRecommendedEvents.length,
      isEnd,
   ])

   const increaseLimit = () => {
      setCurrentLimit((prev) => prev + limit)
      setNumLimitIncreases((prev) => prev + 1)
   }

   useEffect(() => {
      setNonRegisteredRecommendedEvents(
         recommendedEvents.filter(
            (event) => !event.registeredUsers?.includes(authenticatedUser.email)
         )
      )
   }, [recommendedEvents])

   if (!authenticatedUser.email || !userData?.interestsIds) {
      return null
   }

   return (
      <EventsPreview
         limit={limit}
         title={"RECOMMENDED FOR YOU"}
         events={nonRegisteredRecommendedEvents}
         loading={isLoading}
         type={EventsTypes.recommended}
         hidePreview={Boolean(
            !isLoading && !nonRegisteredRecommendedEvents.length
         )}
      />
   )
}

interface Props {
   limit?: number
   // The max number of times we will increase the limit of the query
   // if the recommended events of the current
   // query is less than 20
   maxLimitIncreaseTimes?: number
}

export default RecommendedEvents
