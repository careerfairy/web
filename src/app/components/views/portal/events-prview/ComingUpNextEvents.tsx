import React, { useEffect, useState } from "react";
import EventsPreview, { EventsTypes } from "./EventsPreview";
import livestreamRepo from "../../../../data/firebase/LivestreamRepository";
import { LiveStreamEvent } from "../../../../types/event";
import { usePagination } from "use-pagination-firestore";
import { useAuth } from "../../../../HOCs/AuthProvider";
import EventsPreviewGrid from "./EventsPreviewGrid";
import { useRouter } from "next/router";

const ComingUpNextEvents = ({ limit }: Props) => {
   const { authenticatedUser } = useAuth();
   const {
      query: { livestreamId },
   } = useRouter();
   const [localEvents, setLocalEvents] = useState([]);
   const [eventFromQuery, setEventFromQuery] = useState(null);

   const isLoggedOut = Boolean(
      authenticatedUser.isEmpty && authenticatedUser.isLoaded
   );
   const { items: events, isLoading } = usePagination<LiveStreamEvent>(
      livestreamRepo.upcomingEventsQuery(),
      {
         limit: isLoggedOut ? 80 : limit,
      }
   );
   useEffect(() => {
      if (livestreamId) {
         const unsubscribe = livestreamRepo.listenToSingleEvent(
            livestreamId as string,
            (docSnap) => {
               setEventFromQuery(
                  docSnap.exists ? { id: docSnap.id, ...docSnap.data() } : null
               );
            }
         );

         return () => unsubscribe();
      }
   }, [livestreamId]);
   useEffect(() => {
      const newEventFromQuery = events.find(
         (event) => event.id === eventFromQuery?.id
      );
      const newLocalEvents = [...events];
      if (newEventFromQuery) {
         newLocalEvents.filter((event) => event.id === newEventFromQuery.id);
      }
      if (eventFromQuery) {
         newLocalEvents.unshift(eventFromQuery);
      }
      setLocalEvents(newLocalEvents);
   }, [eventFromQuery, events]);

   if (isLoggedOut) {
      return (
         <EventsPreviewGrid
            id={"upcoming-events"}
            title={"COMING UP NEXT"}
            type={EventsTypes.comingUp}
            seeMoreLink={"/next-livestreams"}
            loading={isLoading}
            events={localEvents}
         />
      );
   }

   return (
      <EventsPreview
         id={"upcoming-events"}
         limit={limit}
         title={"COMING UP NEXT"}
         type={EventsTypes.comingUp}
         events={localEvents}
         seeMoreLink={"/next-livestreams"}
         loading={isLoading}
      />
   );
};

interface Props {
   limit?: number;
}

export default ComingUpNextEvents;
