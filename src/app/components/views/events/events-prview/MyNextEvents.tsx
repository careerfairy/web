import React from "react";
import EventsPreview from "./EventsPreview";
import livestreamRepo from "../../../../data/firebase/LivestreamRepository";
import { useAuth } from "../../../../HOCs/AuthProvider";
import { LiveStreamEvent } from "../../../../types/event";
import { usePagination } from "use-pagination-firestore";

const MyNextEvents = ({ limit }: Props) => {
   const { authenticatedUser } = useAuth();

   const {
      items: events,
      isLoading,
      isStart,
      isEnd,
      getPrev,
      getNext,
   } = usePagination<LiveStreamEvent>(
      livestreamRepo.registeredEventsQuery(authenticatedUser.email),
      {
         limit: limit,
      }
   );

   if (!authenticatedUser.email) {
      return null;
   }

   return (
      <EventsPreview
         limit={limit}
         events={events}
         title={"MY NEXT EVENTS"}
         isStart={isStart}
         isEnd={isEnd}
         loading={isLoading}
         getPrev={getPrev}
         getNext={getNext}
      />
   );
};

interface Props {
   limit?: number;
}

export default MyNextEvents;
