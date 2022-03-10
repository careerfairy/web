import React, { useEffect, useState } from "react";
import EventsPreview from "./EventsPreview";
import livestreamRepo from "../../../../data/firebase/LivestreamRepository";
import { useAuth } from "../../../../HOCs/AuthProvider";
import { LiveStreamEvent } from "types/event";
import { usePagination } from "use-pagination-firestore";

const RecommendedEvents = ({ limit, maxLimitIncreaseTimes }: Props) => {
   const { authenticatedUser, userData } = useAuth();
   const [currentLimit, setCurrentLimit] = useState(limit);
   const [numLimitIncreases, setNumLimitIncreases] = useState(0);

   const [nonRegisteredRecommendedEvents, setNonRegisteredRecommendedEvents] =
      useState<LiveStreamEvent[]>([]);

   const {
      items: recommendedEvents,
      isLoading,
      isEnd,
   } = usePagination<LiveStreamEvent>(
      userData?.interestsIds &&
         livestreamRepo.recommendEventsQuery(userData?.interestsIds),
      {
         limit: currentLimit,
      }
   );
   useEffect(() => {
      if (
         !isEnd &&
         !isLoading &&
         nonRegisteredRecommendedEvents.length < 20 &&
         numLimitIncreases <= maxLimitIncreaseTimes
      ) {
         increaseLimit();
      }
   }, [
      isLoading,
      maxLimitIncreaseTimes,
      nonRegisteredRecommendedEvents.length,
      isEnd,
   ]);

   const increaseLimit = () => {
      setCurrentLimit((prev) => prev + limit);
      setNumLimitIncreases((prev) => prev + 1);
   };

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
         events={nonRegisteredRecommendedEvents}
         loading={isLoading}
      />
   );
};

interface Props {
   limit?: number;
   // The max number of times we will increase the limit of the query
   // if the recommended events of the current
   // query is less than 20
   maxLimitIncreaseTimes?: number;
}

export default RecommendedEvents;
