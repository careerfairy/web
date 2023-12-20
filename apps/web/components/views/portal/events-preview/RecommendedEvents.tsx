import React, { useMemo, useRef } from "react"
import { EventsTypes } from "./EventsPreviewCarousel"
import { useAuth } from "../../../../HOCs/AuthProvider"
import useRecommendedEvents from "../../../custom-hook/useRecommendedEvents"
import { FirebaseInArrayLimit } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import EventsPreviewCarousel, { ChildRefType } from "./EventsPreviewCarousel"
import { EmblaOptionsType } from "embla-carousel-react"

const RecommendedEvents = ({ limit = 10, hideTitle }: Props) => {
   const { authenticatedUser } = useAuth()

   const childRef = useRef<ChildRefType | null>(null)
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
         dragFree: false,
         inViewThreshold: 0,
      }),
      [events]
   )

   if (!authenticatedUser?.email || !events?.length) {
      return null
   }
   // Switch to emblaApi
   return (
      <div>
         <EventsPreviewCarousel
            options={eventsCarouselEmblaOptions}
            limit={limit}
            title={!hideTitle && "RECOMMENDED FOR YOU - EMBLA"}
            events={events}
            type={EventsTypes.recommended}
            loading={loading}
            isRecommended
            isAdmin={true}
            hidePreview={false}
            ref={childRef}
         />
      </div>
   )
}

interface Props {
   limit?: FirebaseInArrayLimit
   hideTitle?: boolean
}

export default RecommendedEvents
