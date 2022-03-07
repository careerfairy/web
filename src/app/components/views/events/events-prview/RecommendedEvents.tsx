import React, { useEffect, useState } from "react";
import EventsPreview from "./EventsPreview";
import livestreamRepo from "../../../../data/firebase/LivestreamRepository";
import { useAuth } from "../../../../HOCs/AuthProvider";
import { useDispatch } from "react-redux";
import * as actions from "store/actions";
import { LiveStreamEvent } from "../../../../types/event";

const RecommendedEvents = ({ limit }: Props) => {
   const { authenticatedUser, userData } = useAuth();
   const [loading, setLoading] = useState(false);
   const [events, setEvents] = useState<LiveStreamEvent[]>(undefined);
   const dispatch = useDispatch();

   useEffect(() => {
      (async function () {
         try {
            setLoading(true);
            if (authenticatedUser.email && userData?.interestsIds?.length) {
               const unsubscribe = livestreamRepo.listenToRecommendedEvents(
                  authenticatedUser.email,
                  userData?.interestsIds,
                  limit,
                  (querySnapshot) => {
                     const interestedEvents =
                        livestreamRepo.getDocumentData(querySnapshot);
                     const nonRegisteredInterestedEvents =
                        interestedEvents.filter(
                           (event) =>
                              !event.registeredUsers?.includes(
                                 authenticatedUser.email
                              )
                        );

                     setEvents(
                        interestedEvents
                           ? nonRegisteredInterestedEvents
                           : interestedEvents
                     );
                     setLoading(false);
                  }
               );
               return () => unsubscribe();
            }
         } catch (e) {
            dispatch(actions.sendGeneralError(e));
         }
      })();
   }, [authenticatedUser.email, userData?.interestsIds]);

   if (!authenticatedUser.email || !userData?.interestsIds) {
      return null;
   }

   return (
      <EventsPreview
         limit={limit}
         title={"RECOMMENDED FOR YOU"}
         events={events}
         loading={loading}
      />
   );
};

interface Props {
   limit?: number;
}

export default RecommendedEvents;
