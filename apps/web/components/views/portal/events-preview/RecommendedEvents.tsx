import React, { useMemo } from "react"
import EventsPreview, { EventsTypes } from "./EventsPreview"
import { useAuth } from "../../../../HOCs/AuthProvider"
import useRecommendedEvents from "../../../custom-hook/useRecommendedEvents"

const RecommendedEvents = ({ limit }: Props) => {
   const { authenticatedUser } = useAuth()

   const options = useMemo(
      () => ({
         limit,
      }),
      [limit]
   )

   const { loading, events } = useRecommendedEvents(options)

   if (!authenticatedUser.email || !events?.length) {
      return null
   }

   return (
      <EventsPreview
         limit={limit}
         title={"RECOMMENDED FOR YOU"}
         events={events}
         type={EventsTypes.recommended}
         loading={loading}
      />
   )
}

interface Props {
   limit?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 // max of 10 events to allow for firestore query limit
}

export default RecommendedEvents
