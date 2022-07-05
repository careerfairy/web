import React, { useMemo } from "react"
import EventsPreview, { EventsTypes } from "./EventsPreview"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { usePagination } from "use-pagination-firestore"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { livestreamRepo } from "../../../../data/RepositoryInstances"

const MyNextEvents = ({ limit }: Props) => {
   const { authenticatedUser } = useAuth()

   const registeredEventsQuery = useMemo(() => {
      return livestreamRepo.registeredEventsQuery(authenticatedUser.email)
   }, [authenticatedUser?.email])

   const { items: events, isLoading } = usePagination<LivestreamEvent>(
      registeredEventsQuery,
      {
         limit: limit,
      }
   )

   if (!authenticatedUser.email) {
      return null
   }

   return (
      <EventsPreview
         limit={limit}
         type={EventsTypes.myNext}
         events={events}
         isEmpty={Boolean(!isLoading && !events.length)}
         title={"MY NEXT EVENTS"}
         loading={isLoading || (!isLoading && !events.length)}
      />
   )
}

interface Props {
   limit?: number
}

export default MyNextEvents
