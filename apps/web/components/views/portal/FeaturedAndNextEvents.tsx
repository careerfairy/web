import React, { useCallback, useMemo, useState } from "react"
import EventPreviewCard from "../common/stream-cards/EventPreviewCard"
import Stack from "@mui/material/Stack"
import { Box, Grid } from "@mui/material"
import { usePagination } from "use-pagination-firestore"
import livestreamRepo from "../../../data/firebase/LivestreamRepository"
import { useAuth } from "../../../HOCs/AuthProvider"
import EventNameCard from "../common/stream-cards/EventNameCard"
import Heading from "./common/Heading"
import { useInterests } from "../../custom-hook/useCollection"
import useRegistrationModal from "../../custom-hook/useRegistrationModal"
import RegistrationModal from "../common/registration-modal"
import { useRouter } from "next/router"
import { alpha } from "@mui/material/styles"
import EmptyMessageOverlay from "./events-preview/EmptyMessageOverlay"
import ShareLivestreamModal from "../common/ShareLivestreamModal"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"

const styles = {
   root: {
      "& > *": {
         flex: 1,
      },
   },
   verticalHeading: {
      writingMode: { xs: "", md: "vertical-rl" },
      textOrientation: { xs: "", md: "mixed" },
      pl: (theme) => ({ xs: theme.spacing(1, 0), md: 2 }),
      transform: { xs: "", md: "rotate(180deg)" },
      textAlign: { xs: "start", md: "start" },
   },
   section: {
      display: "flex",
      alignItems: { md: "end", xs: undefined },
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
      alignSelf: "start",
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
      fontSize: "1.2rem",
      fontWeight: 600,
   },
   cardWrapper: {
      flex: 1,
      display: "flex",
      alignItems: "flex-end",
      "& > *": { width: "100%" },
   },
} as const
const FeaturedAndNextEvents = () => {
   const { data: existingInterests } = useInterests()
   const { joinGroupModalData, handleCloseJoinModal, handleClickRegister } =
      useRegistrationModal()
   const {
      query: { groupId },
      asPath,
   } = useRouter()

   const featuredEventQuery = useMemo(() => {
      return livestreamRepo.featuredEventQuery()
   }, [])

   const { items: featuredEvents, isLoading } = usePagination<LivestreamEvent>(
      featuredEventQuery,
      {
         limit: 1,
      }
   )
   const { authenticatedUser, isLoggedOut } = useAuth()
   const [shareEventDialog, setShareEventDialog] = useState(null)

   const handleShareEventDialogClose = useCallback(() => {
      setShareEventDialog(null)
   }, [setShareEventDialog])

   const registeredEventsQuery = useMemo(() => {
      return livestreamRepo.registeredEventsQuery(authenticatedUser.email)
   }, [authenticatedUser?.email])

   const { items: nextEvents, isLoading: loadingNextEvents } =
      usePagination<LivestreamEvent>(registeredEventsQuery, {
         limit: 3,
      })

   const noEvents = Boolean(!isLoading && (isLoggedOut || !nextEvents.length))

   return (
      <>
         <Grid container spacing={{ xs: 2, md: 10 }} sx={styles.root}>
            <Grid item xs={12} md={6} sx={[styles.section]}>
               <Heading sx={styles.verticalHeading}>FEATURED EVENT</Heading>
               <Box sx={styles.cardWrapper}>
                  <EventPreviewCard
                     loading={isLoading}
                     interests={existingInterests}
                     light
                     openShareDialog={setShareEventDialog}
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
         {shareEventDialog ? (
            /*
                    // @ts-ignore */
            <ShareLivestreamModal
               livestreamData={shareEventDialog}
               handleClose={handleShareEventDialogClose}
            />
         ) : (
            ""
         )}
      </>
   )
}

export default FeaturedAndNextEvents
