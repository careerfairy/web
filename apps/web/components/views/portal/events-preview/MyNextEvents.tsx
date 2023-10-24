import React, { useMemo } from "react"
import EventsPreview, { EventsTypes } from "./EventsPreview"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { livestreamRepo } from "../../../../data/RepositoryInstances"
import { useFirestoreCollection } from "components/custom-hook/utils/useFirestoreCollection"

const config = {
   suspense: false,
}

const MyNextEvents = ({ limit }: Props) => {
   const { authenticatedUser } = useAuth()

   const registeredEventsQuery = useMemo(() => {
      return livestreamRepo.registeredEventsQuery(
         authenticatedUser.email,
         limit
      )
   }, [authenticatedUser.email, limit])

   const { data: events, status } = useFirestoreCollection<LivestreamEvent>(
      registeredEventsQuery,
      config
   )

   const isLoading = status === "loading"

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
