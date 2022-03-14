import React from "react";
import { LiveStreamEvent } from "types/event";
import EventPreviewCard from "../common/stream-cards/EventPreviewCard";
import Stack from "@mui/material/Stack";
import { Box, Button, Grid, Typography } from "@mui/material";
import { usePagination } from "use-pagination-firestore";
import livestreamRepo from "../../../data/firebase/LivestreamRepository";
import { useAuth } from "../../../HOCs/AuthProvider";
import EventNameCard from "../common/stream-cards/EventNameCard";
import Heading from "./common/Heading";
import { useInterests } from "../../custom-hook/useCollection";
import useRegistrationModal from "../../custom-hook/useRegistrationModal";
import RegistrationModal from "../common/registration-modal";
import { useRouter } from "next/router";
import { alpha } from "@mui/material/styles";
import Link from "../common/Link";
import EmptyMessageOverlay from "./events-prview/EmptyMessageOverlay";

const styles = {
   root: {
      "& > *": {
         flex: 1,
      },
   },
   verticalHeading: {
      writingMode: { xs: "", md: "vertical-rl" },
      textOrientation: { xs: "", md: "mixed" },
      p: (theme) => ({ xs: theme.spacing(1, 0), md: 1 }),
      transform: { xs: "", md: "rotate(180deg)" },
      textAlign: { xs: "start", md: "center" },
   },
   section: {
      display: "flex",
      flexDirection: {
         xs: "column",
         md: "row",
      },
   },
   noEventsWrapper: {
      borderRadius: 2,
      p: 3,
      m: "auto",
   },
   eventsStack: {
      position: "relative",
      flex: 1,
   },
   stackOverlay: {
      position: "absolute",
      inset: 0,
      display: "grid",
      placeItems: "center",
      backgroundColor: (theme) => alpha(theme.palette.common.white, 0.2),
      backdropFilter: "blur(2px)",
      p: 3,
      zIndex: 1,
   },
   overlayText: {
      fontWeight: 600,
   },
} as const;
const FeaturedAndNextEvents = () => {
   const { data: existingInterests } = useInterests();
   const { joinGroupModalData, handleCloseJoinModal, handleClickRegister } =
      useRegistrationModal();
   const {
      query: { groupId },
      asPath,
   } = useRouter();
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

   const isLoggedOut = authenticatedUser.isLoaded && authenticatedUser.isEmpty;
   const noEvents = Boolean(!isLoading && (isLoggedOut || !nextEvents.length));

   return (
      <>
         <Grid container sx={styles.root}>
            <Grid item xs={12} md={6} sx={[styles.section]}>
               <Heading sx={styles.verticalHeading}>FEATURED EVENT</Heading>
               <Box sx={{ flex: 1 }}>
                  <EventPreviewCard
                     loading={isLoading}
                     interests={existingInterests}
                     light
                     onRegisterClick={handleClickRegister}
                     event={featuredEvents[0]}
                  />
               </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={styles.section}>
               <Heading sx={styles.verticalHeading}>MY NEXT EVENTS</Heading>
               <Stack sx={styles.eventsStack} spacing={1}>
                  {noEvents && (
                     <EmptyMessageOverlay
                        buttonLink={
                           isLoggedOut
                              ? `/signup?absolutePath=${asPath}`
                              : "#upcoming-events"
                        }
                        buttonText={
                           isLoggedOut ? "Register now!" : "Browse Events"
                        }
                        message={
                           isLoggedOut
                              ? "Don't have an account?"
                              : "Time to register to your next event!\n"
                        }
                     />
                  )}
                  {nextEvents.length
                     ? nextEvents.map((nextEvent) => (
                          <EventNameCard key={nextEvent.id} event={nextEvent} />
                       ))
                     : [...Array(3)].map((_, i) => (
                          <EventNameCard
                             key={i}
                             loading
                             animation={loadingNextEvents ? "pulse" : false}
                          />
                       ))}
               </Stack>
            </Grid>
         </Grid>
         {joinGroupModalData && (
            <RegistrationModal
               open={Boolean(joinGroupModalData)}
               onFinish={handleCloseJoinModal}
               promptOtherEventsOnFinal={!groupId}
               livestream={joinGroupModalData?.livestream}
               groups={joinGroupModalData?.groups}
               targetGroupId={joinGroupModalData?.targetGroupId}
               handleClose={handleCloseJoinModal}
            />
         )}
      </>
   );
};

export default FeaturedAndNextEvents;
