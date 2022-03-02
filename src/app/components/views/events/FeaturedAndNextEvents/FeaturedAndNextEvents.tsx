import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import { LiveStreamEvent } from "types/event";
import { delay } from "../../../helperFunctions/HelperFunctions";
import { dummyEvent } from "../dummyData";
import EventPreviewCard from "../../common/stream-cards/EventPreviewCard";

const FeaturedAndNextEvents = () => {
   const [featuredEvent, setFeaturedEvent] =
      useState<LiveStreamEvent>(undefined);
   const [nextEvents, setNextEvents] = useState<LiveStreamEvent[]>(undefined);
   const [loadingNextEvents, setLoadingNextEvents] = useState(false);
   const [loadingFeaturedEvent, setLoadingFeaturedEvent] = useState(false);

   useEffect(() => {
      void getFeaturedEvent();
   }, []);
   useEffect(() => {
      void getNextEvents();
   }, []);

   const getFeaturedEvent = async (empty?: boolean) => {
      setLoadingFeaturedEvent(true);
      await delay(1500);
      setFeaturedEvent(empty ? null : dummyEvent);
      setLoadingFeaturedEvent(false);
   };
   const getNextEvents = async (empty?: boolean) => {
      setLoadingNextEvents(true);
      await delay(2000);
      setNextEvents(empty ? null : Array(3).fill(dummyEvent));
      setLoadingNextEvents(false);
   };

   return (
      <Grid container spacing={2}>
         {featuredEvent && (
            <Grid item xs={12} sm={nextEvents ? 6 : 12}>
               <EventPreviewCard event={featuredEvent} />
            </Grid>
         )}
         {nextEvents && (
            <Grid item xs={12} sm={featuredEvent ? 6 : 12}>
               Next Events
            </Grid>
         )}
      </Grid>
   );
};

interface FeaturedAndNextEventsProps {
   featuredEvent: LiveStreamEvent;
   nextEvents: LiveStreamEvent[];
}
export default FeaturedAndNextEvents;
