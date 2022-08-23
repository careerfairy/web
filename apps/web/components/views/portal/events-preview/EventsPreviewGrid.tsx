import React, { useCallback, useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import EventPreviewCard from "../../common/stream-cards/EventPreviewCard"
import Link from "next/link"
import RegistrationModal from "components/views/common/registration-modal"
import { useRouter } from "next/router"
import useRegistrationModal from "../../../custom-hook/useRegistrationModal"
import Stack from "@mui/material/Stack"
import Heading from "../common/Heading"
import { useInterests } from "../../../custom-hook/useCollection"
import SearchIcon from "@mui/icons-material/Search"
import { Button, Grid } from "@mui/material"
import LazyLoad from "react-lazyload"
import useInfiniteScrollClientWithHandlers from "components/custom-hook/useInfiniteScrollClientWithHandlers"
import ShareLivestreamModal from "../../common/ShareLivestreamModal"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { LANDING_PAGE_PATH } from "../../../../constants/routes"

const arrowFontSize = 30

const styles = {
   carouselButtonDisabled: {
      width: 0,
   },
   buttonLeft: {
      left: 0,
   },
   buttonRight: {
      right: 0,
   },
   carousel: {
      "& .slick-track": {
         ml: 0,
         mr: 0,
      },
      "& .slick-next": {
         right: "10px",
         "&:before": {
            opacity: 1,
            fontSize: arrowFontSize,
            textShadow: (theme) => theme.darkTextShadow,
         },
      },
      "& .slick-prev": {
         left: "10px",
         zIndex: 1,
         "&:before": {
            opacity: 1,
            fontSize: arrowFontSize,
            textShadow: (theme) => theme.darkTextShadow,
         },
      },
   },
   eventsHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
   },
   seeMoreText: {
      color: "text.secondary",
      fontSize: "1.2rem",
      fontWeight: 600,
   },
   noEventsWrapper: {
      p: 2,
   },
} as const

const EventsPreviewGrid = ({
   title,
   seeMoreLink,
   loading,
   events,
   type,
   id,
}: EventsProps) => {
   const {
      query: { groupId },
   } = useRouter()
   const { joinGroupModalData, handleCloseJoinModal, handleClickRegister } =
      useRegistrationModal(true)
   const { data: existingInterests } = useInterests()
   const [slicedEvents] = useInfiniteScrollClientWithHandlers(events, 6, 3)
   const [shareEventDialog, setShareEventDialog] = useState(null)
   const { pathname } = useRouter()
   const isOnLandingPage = pathname.includes(LANDING_PAGE_PATH)

   const handleShareEventDialogClose = useCallback(() => {
      setShareEventDialog(null)
   }, [setShareEventDialog])

   return (
      <>
         <Box sx={{ px: 2 }} id={id}>
            <Box sx={styles.eventsHeader}>
               <Heading>{title}</Heading>
               {isOnLandingPage ? null : (
                  <Link href={seeMoreLink}>
                     <a>
                        <Typography sx={styles.seeMoreText} color="grey">
                           See more
                        </Typography>
                     </a>
                  </Link>
               )}
            </Box>
            <Stack>
               {!loading && !events.length ? (
                  <Stack
                     spacing={2}
                     direction={"column"}
                     alignItems={"center"}
                     justifyContent="center"
                     sx={styles.noEventsWrapper}
                  >
                     <Typography variant="h6">
                        {type === EventsTypes.myNext
                           ? "You’re not registered for any event yet."
                           : "There currently aren't any scheduled events"}
                     </Typography>
                     {isOnLandingPage ? null : (
                        <Link
                           href={
                              type === EventsTypes.myNext
                                 ? "/next-livestreams"
                                 : "/next-livestreams?type=pastEvents"
                           }
                        >
                           <a>
                              <Button
                                 variant="contained"
                                 endIcon={<SearchIcon />}
                              >
                                 {type === EventsTypes.myNext
                                    ? "Find an event"
                                    : "See Past Events"}
                              </Button>
                           </a>
                        </Link>
                     )}
                  </Stack>
               ) : (
                  <Grid container spacing={2}>
                     {/*@ts-ignore*/}
                     {slicedEvents.map((event) => (
                        <Grid item key={event.id} xs={12} sm={6} lg={4}>
                           <LazyLoad
                              key={event.id}
                              style={{ width: "100%" }}
                              height={309}
                              debounce={100}
                              scroll
                              once
                              offset={600}
                              placeholder={
                                 <EventPreviewCard event={event} loading />
                              }
                           >
                              <EventPreviewCard
                                 interests={existingInterests}
                                 openShareDialog={setShareEventDialog}
                                 onRegisterClick={handleClickRegister}
                                 key={event.id}
                                 event={event}
                              />
                           </LazyLoad>
                        </Grid>
                     ))}
                  </Grid>
               )}
            </Stack>
         </Box>

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
   events: LivestreamEvent[]
   seeMoreLink?: string
   title?: string
   loading: boolean
   type: EventsTypes
   id?: string
   // Not all portal widget should
   // have automatic event registrations
   // to avoid duplicate events clashing
}

export default EventsPreviewGrid
