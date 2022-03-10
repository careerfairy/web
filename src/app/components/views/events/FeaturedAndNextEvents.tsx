import React from "react";
import { LiveStreamEvent } from "types/event";
import EventPreviewCard from "../common/stream-cards/EventPreviewCard";
import Stack from "@mui/material/Stack";
import { Box, CircularProgress, Grid, Typography } from "@mui/material";
import { usePagination } from "use-pagination-firestore";
import livestreamRepo from "../../../data/firebase/LivestreamRepository";
import { useAuth } from "../../../HOCs/AuthProvider";
import EventNameCard from "../common/stream-cards/EventNameCard";

const styles = {
   root: {
      "& > *": {
         flex: 1,
      },
   },
   verticalHeading: {
      writingMode: "vertical-rl",
      textOrientation: "mixed",
      p: 1,
      transform: "rotate(180deg)",
      color: "text.secondary",
      textAlign: "center",
      fontWeight: 500,
      opacity: 0.8,
   },
   section: {
      display: "flex",
   },
} as const;
const FeaturedAndNextEvents = () => {
   const { items: featuredEvents, isLoading } = usePagination<LiveStreamEvent>(
      livestreamRepo.featuredEventQuery(),
      {
         limit: 1,
      }
   );
   const { authenticatedUser } = useAuth();

   const { items: nextEvents, isLoading: loadingNextEvents } =
      usePagination<LiveStreamEvent>(
         livestreamRepo.registeredEventsQuery(authenticatedUser.email),
         {
            limit: 3,
         }
      );
   console.log("-> nextEvents", nextEvents);

   return (
      <Grid container sx={styles.root}>
         <Grid item xs={12} lg={6} sx={styles.section}>
            <Typography variant={"h4"} sx={styles.verticalHeading}>
               FEATURED EVENT
            </Typography>
            <Box sx={{ flex: 1 }}>
               <EventPreviewCard
                  loading={isLoading}
                  light
                  event={featuredEvents[0]}
               />
            </Box>
         </Grid>
         <Grid item xs={12} lg={6} sx={styles.section}>
            <Typography variant={"h4"} sx={styles.verticalHeading}>
               MY NEXT EVENTS
            </Typography>
            {!loadingNextEvents && !nextEvents.length ? (
               <Typography>MY NEXT EVENTS</Typography>
            ) : (
               <Stack spacing={1}>
                  {loadingNextEvents
                     ? Array(3).fill(
                          <Box sx={{ pr: 2 }}>
                             <EventNameCard loading />
                          </Box>
                       )
                     : nextEvents.map((nextEvent) => (
                          <EventNameCard event={nextEvent} />
                       ))}
               </Stack>
            )}
         </Grid>
      </Grid>
   );
};

export default FeaturedAndNextEvents;
