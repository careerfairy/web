import React, { useEffect, useState } from "react";
import EventsPreview from "./EventsPreview";
import livestreamRepo from "../../../../data/firebase/LivestreamRepository";
import { useAuth } from "../../../../HOCs/AuthProvider";
import { useDispatch } from "react-redux";
import * as actions from "store/actions";
import { LiveStreamEvent } from "../../../../types/event";

const MyNextEvents = ({ limit }: Props) => {
   const { authenticatedUser } = useAuth();
   const [loading, setLoading] = useState(false);
   const [events, setEvents] = useState<LiveStreamEvent[]>(undefined);
   const dispatch = useDispatch();

   useEffect(() => {
      (async function () {
         try {
            setLoading(true);
            const unsubscribe = livestreamRepo.listenToRegisteredEvents(
               authenticatedUser.email,
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
      })();
   }, [authenticatedUser.email]);

   if (!authenticatedUser.email) {
      return null;
   }

   return (
      <EventsPreview
         limit={limit}
         title={"MY NEXT EVENTS"}
         events={events}
         loading={loading}
      />
   );
};

interface Props {
   limit?: number;
}

export default MyNextEvents;
