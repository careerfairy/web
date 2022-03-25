import React, { useMemo } from "react"
import EventsPreview, { EventsTypes } from "./EventsPreview"
import livestreamRepo from "../../../../data/firebase/LivestreamRepository"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { LiveStreamEvent } from "../../../../types/event"
import { usePagination } from "use-pagination-firestore"

const MyNextEvents = ({ limit }: Props) => {
   const { authenticatedUser } = useAuth()

   const registeredEventsQuery = useMemo(() => {
      return livestreamRepo.registeredEventsQuery(authenticatedUser.email)
   }, [authenticatedUser?.email])

   const { items: events, isLoading } = usePagination<LiveStreamEvent>(
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
