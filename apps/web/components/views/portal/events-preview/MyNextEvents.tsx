import React, { useMemo } from "react"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { livestreamRepo } from "../../../../data/RepositoryInstances"
import { useFirestoreCollection } from "components/custom-hook/utils/useFirestoreCollection"
import EventsPreviewCarousel, { EventsTypes } from "./EventsPreviewCarousel"
import { EmblaOptionsType } from "embla-carousel-react"

const config = {
   suspense: false,
   initialData: [],
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

   const isLoading = status === "loading"

   if (!authenticatedUser.email) {
      return null
   }

   return (
      <EventsPreviewCarousel
         id={"my-next-events"}
         type={EventsTypes.myNext}
         events={events}
         isEmpty={Boolean(!isLoading && !events.length)}
         title={"MY NEXT EVENTS"}
         loading={isLoading || (!isLoading && !events.length)}
         options={eventsCarouselEmblaOptions}
      />
   )
}

interface Props {
   limit?: number
}

export default MyNextEvents
