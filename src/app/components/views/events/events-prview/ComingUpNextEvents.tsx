import React from "react";
import EventsPreview from "./EventsPreview";
import livestreamRepo from "../../../../data/firebase/LivestreamRepository";
import { LiveStreamEvent } from "../../../../types/event";
import { usePagination } from "use-pagination-firestore";

const ComingUpNextEvents = ({ limit }: Props) => {
   const {
      items: events,
      isLoading,
      isStart,
      isEnd,
      getPrev,
      getNext,
   } = usePagination<LiveStreamEvent>(livestreamRepo.upcomingEventsQuery(), {
      limit: limit,
   });

   return (
      <EventsPreview
         limit={limit}
         title={"COMING UP NEXT"}
         events={events}
         seeMoreLink={"/next-livestreams"}
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

export default ComingUpNextEvents;
