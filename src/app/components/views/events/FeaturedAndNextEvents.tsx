import React, { useEffect, useState } from "react";
import { LiveStreamEvent } from "types/event";
import { delay } from "../../helperFunctions/HelperFunctions";
import { dummyEvent } from "./dummyData";
import EventPreviewCard from "../common/stream-cards/EventPreviewCard";
import Stack from "@mui/material/Stack";
import { Typography } from "@mui/material";

const styles = {
   root: {
      "& > *": {
         flex: 1,
      },
   },
} as const;
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
      <Stack sx={styles.root} direction={"row"} spacing={2}>
         {featuredEvent && <EventPreviewCard light event={featuredEvent} />}
         {nextEvents && <Typography>Next Events</Typography>}
      </Stack>
   );
};

export default FeaturedAndNextEvents;
