import React, { useMemo } from "react"
import EventsPreview, { EventsTypes } from "./EventsPreview"
import { useAuth } from "../../../../HOCs/AuthProvider"
import useRecommendedEvents from "../../../custom-hook/useRecommendedEvents"
import { FirebaseInArrayLimit } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"

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
         isRecommended
      />
   )
}

interface Props {
   limit?: FirebaseInArrayLimit
}

export default RecommendedEvents
