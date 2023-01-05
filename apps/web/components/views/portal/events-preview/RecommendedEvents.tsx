import React, { useMemo } from "react"
import EventsPreview, { EventsTypes } from "./EventsPreview"
import { useAuth } from "../../../../HOCs/AuthProvider"
import useRecommendedEvents from "../../../custom-hook/useRecommendedEvents"
import { FirebaseInArrayLimit } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"

const RecommendedEvents = ({ limit = 10, hideTitle }: Props) => {
   const { authenticatedUser } = useAuth()

   const options = useMemo(
      () => ({
         limit,
      }),
      [limit]
   )

   const { loading, events } = useRecommendedEvents(options)

   if (!authenticatedUser?.email || !events?.length) {
      return null
   }

   return (
      <EventsPreview
         limit={limit}
         title={!hideTitle && "RECOMMENDED FOR YOU"}
         events={events}
         type={EventsTypes.recommended}
         loading={loading}
         isRecommended
      />
   )
}

interface Props {
   limit?: FirebaseInArrayLimit
   hideTitle?: boolean
}

export default RecommendedEvents
