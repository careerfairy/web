import React, { useEffect, useState } from "react";
import EventsPreview from "./EventsPreview";
import livestreamRepo from "../../../../data/firebase/LivestreamRepository";
import { useAuth } from "../../../../HOCs/AuthProvider";
import { LiveStreamEvent } from "types/event";
import { usePagination } from "use-pagination-firestore";

const RecommendedEvents = ({ limit }: Props) => {
   const { authenticatedUser, userData } = useAuth();
   const [nonRegisteredRecommendedEvents, setNonRegisteredRecommendedEvents] =
      useState<LiveStreamEvent[]>([]);

   const {
      items: recommendedEvents,
      isLoading,
      isStart,
      isEnd,
      getPrev,
      getNext,
   } = usePagination<LiveStreamEvent>(
      userData?.interestsIds &&
         livestreamRepo.recommendEventsQuery(userData?.interestsIds),
      {
         limit: limit,
      }
   );

   useEffect(() => {
      setNonRegisteredRecommendedEvents(
         recommendedEvents.filter(
            (event) => !event.registeredUsers?.includes(authenticatedUser.email)
         )
      );
   }, [recommendedEvents]);

   if (!authenticatedUser.email || !userData?.interestsIds) {
      return null;
   }

   return (
      <EventsPreview
         limit={limit}
         title={"RECOMMENDED FOR YOU"}
         isStart={isStart}
         isEnd={isEnd}
         events={nonRegisteredRecommendedEvents}
         loading={isLoading}
         getPrev={getPrev}
         getNext={getNext}
      />
   );
};

interface Props {
   limit?: number;
}

export default RecommendedEvents;
