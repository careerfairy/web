import React, { useMemo, useRef } from "react"
import { EventsTypes } from "./EventsPreviewCarousel"
import { useAuth } from "../../../../HOCs/AuthProvider"
import useRecommendedEvents from "../../../custom-hook/useRecommendedEvents"
import { FirebaseInArrayLimit } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import EventsPreviewCarousel, { ChildRefType } from "./EventsPreviewCarousel"
import { EmblaOptionsType } from "embla-carousel-react"

const RecommendedEvents = ({ limit = 10, hideTitle }: Props) => {
   const { authenticatedUser, userData } = useAuth()

   const options = useMemo(
      () => ({
         limit,
      }),
      [limit]
   )

   const { loading, events } = useRecommendedEvents(options)

   const eventsCarouselEmblaOptions = useMemo<EmblaOptionsType>(
      () => ({
         axis: "x",
         loop: false,
         align: "center",
         dragThreshold: 0.5,
         dragFree: true,
         inViewThreshold: 0,
      }),
      []
   )

   if (!authenticatedUser?.email || !events?.length) {
      return null
   }
   return (
      <div>
         <EventsPreviewCarousel
            options={eventsCarouselEmblaOptions}
            title={!hideTitle && "RECOMMENDED FOR YOU"}
            events={events}
            type={EventsTypes.recommended}
            loading={loading}
            isRecommended
            isAdmin={userData?.isAdmin}
            seeMoreLink="/next-livestreams"
         />
      </div>
   )
}

interface Props {
   limit?: FirebaseInArrayLimit
   hideTitle?: boolean
}

export default RecommendedEvents
