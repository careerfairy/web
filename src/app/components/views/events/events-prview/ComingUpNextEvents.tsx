import React, { useEffect, useState } from "react";
import EventsPreview from "./EventsPreview";
import livestreamRepo from "../../../../data/firebase/LivestreamRepository";
import { useDispatch } from "react-redux";
import * as actions from "store/actions";
import { LiveStreamEvent } from "../../../../types/event";

const ComingUpNextEvents = ({ limit }: Props) => {
   const [loading, setLoading] = useState(false);
   const [events, setEvents] = useState<LiveStreamEvent[]>(undefined);
   const dispatch = useDispatch();

   useEffect(() => {
      (async function () {
         try {
            setLoading(true);
            setLoading(true);
            const unsubscribe = livestreamRepo.listenToUpcomingEvents(
               12,
               (snap) => {
                  setEvents(livestreamRepo.getDocumentData(snap));
                  setLoading(false);
               }
            );
            return () => unsubscribe();
         } catch (e) {
            dispatch(actions.sendGeneralError(e));
         }
         setLoading(false);
      })();
   }, []);

   return (
      <EventsPreview
         limit={limit}
         title={"COMING UP NEXT"}
         events={events}
         loading={loading}
         seeMoreLink={"/next-livestreams"}
      />
   );
};

interface Props {
   limit?: number;
}

export default ComingUpNextEvents;
