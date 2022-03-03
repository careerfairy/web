import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import livestreamRepo from "../../../../data/firebase/LivestreamRepository";
import { QuerySnapshot } from "@firebase/firestore-types";
import { CircularProgress, Grid, Typography } from "@mui/material";
import { LiveStreamEvent } from "../../../../types/event";
import EventPreviewCard from "../../common/stream-cards/EventPreviewCard";
import { useDispatch } from "react-redux";
import * as actions from "store/actions";
import { useAuth } from "../../../../HOCs/AuthProvider";

const styles = {
   eventsGrid: {
      display: "grid",
      gap: (theme) => theme.spacing(2),
      gridAutoFlow: "column",
      gridAutoColumns: (theme) => theme.spacing(36),
      scrollSnapType: "x",
      transition: "transform 0.5s ease-out 0s",
      willChange: "transform",
      overflowX: "scroll",
      padding: (theme) => theme.spacing(0, 0, 2),
   },
} as const;

const EventsPreview = ({ typeOfEvents, limit = 12 }: EventsProps) => {
   const dispatch = useDispatch();
   const [events, setEvents] = useState<LiveStreamEvent[]>(undefined);
   const [loading, setLoading] = useState(true);
   const { authenticatedUser } = useAuth();

   useEffect(() => {
      (async function getEvents() {
         let newEvents = null;
         let snapshots: QuerySnapshot;
         try {
            setLoading(true);
            if (typeOfEvents === EventsTypes.comingUp) {
               snapshots = await livestreamRepo.getUpcomingEvents(limit);
            }
            if (typeOfEvents === EventsTypes.recommended) {
            }
            if (typeOfEvents === EventsTypes.myNext) {
               snapshots = await livestreamRepo.getRegisteredEvents(
                  authenticatedUser.email,
                  limit
               );
            }
            if (snapshots && !snapshots.empty) {
               newEvents = snapshots.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
               }));
            }
         } catch (e) {
            dispatch(actions.sendGeneralError(e));
         }
         setLoading(false);
         setEvents(newEvents);
      })();
   }, [typeOfEvents, authenticatedUser.email]);

   const getTitle = () => {
      switch (typeOfEvents) {
         case EventsTypes.comingUp:
            return "COMING UP NEXT";
         case EventsTypes.recommended:
            return "RECOMMENDED FOR YOU";
         case EventsTypes.myNext:
            return "MY NEXT EVENTS";
         default:
            return "";
      }
   };

   return (
      <Box>
         <Typography fontWeight={500} color="text.secondary" variant="h5">
            {getTitle()}
         </Typography>
         <Box sx={styles.eventsGrid}>
            {events === undefined || loading ? (
               <CircularProgress />
            ) : events === null ? (
               <Typography>No Events</Typography>
            ) : (
               <>
                  {events.map((event) => (
                     <EventPreviewCard key={event.id} event={event} />
                  ))}
               </>
            )}
         </Box>
      </Box>
   );
};

export enum EventsTypes {
   /**
    * Top Picks for User based on the interests they selected at signup
    */
   recommended = "recommended",
   /**
    * Non specific upcoming events on careerfairy ordered closest start date
    */
   comingUp = "comingUp",
   /**
    * upcoming events on that user has registered to ordered closest start date
    */
   myNext = "myNext",
}

export interface EventsProps {
   typeOfEvents: EventsTypes;
   limit?: number;
}

export default EventsPreview;
