import React, { useCallback, useMemo, useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { LiveStreamEvent } from "../../../../types/event"
import EventPreviewCard from "../../common/stream-cards/EventPreviewCard"
import Link from "next/link"
import RegistrationModal from "components/views/common/registration-modal"
import { useRouter } from "next/router"
import useRegistrationModal from "../../../custom-hook/useRegistrationModal"
import { alpha, useTheme } from "@mui/material/styles"
import Slider from "react-slick"
import Stack from "@mui/material/Stack"
import useMediaQuery from "@mui/material/useMediaQuery"
import Heading from "../common/Heading"
import { useInterests } from "../../../custom-hook/useCollection"
import EmptyMessageOverlay from "./EmptyMessageOverlay"
import ShareLivestreamModal from "../../common/ShareLivestreamModal"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"

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
   previewContent: {
      position: "relative",
   },
   emptyContentOverlay: {
      position: "absolute",
      inset: 0,
      display: "grid",
      placeItems: "center",
      backgroundColor: (theme) => alpha(theme.palette.common.white, 0.2),
      backdropFilter: "blur(2px)",
      p: 3,
      zIndex: 1,
   },
   noEventsWrapper: {
      p: 2,
   },
} as const

const EventsPreview = ({
   title,
   seeMoreLink,
   loading,
   limit,
   events,
   hidePreview,
   type,
   id,
   isEmpty,
}: EventsProps) => {
   const {
      query: { groupId },
   } = useRouter()
   const { joinGroupModalData, handleCloseJoinModal, handleClickRegister } =
      useRegistrationModal()
   const { data: existingInterests } = useInterests()

   const {
      breakpoints: { up },
   } = useTheme()
   const isSmall = useMediaQuery(up("xs"))
   const isMedium = useMediaQuery(up("md"))
   const isLarge = useMediaQuery(up("lg"))
   const [shareEventDialog, setShareEventDialog] = useState(null)

   const handleShareEventDialogClose = useCallback(() => {
      setShareEventDialog(null)
   }, [setShareEventDialog])
   const numSlides: number = useMemo(() => {
      return isLarge ? 3 : isMedium ? 2 : 1
   }, [isSmall, isMedium, isLarge])

   const [cardsLoaded, setCardsLoaded] = useState({})

   const handleCardsLoaded = (cardsIndexLoaded: number[]) => {
      setCardsLoaded((prev) => ({
         ...prev,
         ...cardsIndexLoaded.reduce(
            (acc, curr) => ({ ...acc, [curr]: true }),
            {}
         ),
      }))
   }
   return (
      <>
         {!hidePreview && (
            <Box id={id}>
               <Box sx={styles.eventsHeader}>
                  <Heading>{title}</Heading>
                  {events?.length >= limit && (
                     <Link href={seeMoreLink}>
                        <a>
                           <Typography sx={styles.seeMoreText} color="grey">
                              See more
                           </Typography>
                        </a>
                     </Link>
                  )}
               </Box>
               <Stack sx={styles.previewContent}>
                  {isEmpty && (
                     <EmptyMessageOverlay
                        message={
                           type === EventsTypes.myNext
                              ? "Time to register to your next event!"
                              : "There currently aren't any scheduled events"
                        }
                        buttonText={
                           type === EventsTypes.myNext
                              ? "Browse Events"
                              : "See Past Events"
                        }
                        buttonLink={
                           type === EventsTypes.myNext
                              ? "/next-livestreams"
                              : "/next-livestreams?type=pastEvents"
                        }
                     />
                  )}
                  <Box
                     sx={styles.carousel}
                     component={Slider}
                     autoplay={false}
                     lazyLoad
                     key={events?.length}
                     infinite={false}
                     onLazyLoad={handleCardsLoaded}
                     arrows
                     slidesToShow={numSlides}
                     slidesToScroll={numSlides}
                     initialSlide={0}
                  >
                     {loading
                        ? [...Array(numSlides)].map((_, i) => (
                             <Box key={i} sx={{ pr: { xs: 0, sm: 2 } }}>
                                <EventPreviewCard
                                   animation={isEmpty ? false : undefined}
                                   loading
                                />
                             </Box>
                          ))
                        : events.map((event, index) => (
                             <Box key={event.id} sx={{ pr: { xs: 0, sm: 2 } }}>
                                <EventPreviewCard
                                   loading={!cardsLoaded[index]}
                                   interests={existingInterests}
                                   autoRegister
                                   openShareDialog={setShareEventDialog}
                                   onRegisterClick={handleClickRegister}
                                   key={event.id}
                                   event={event}
                                />
                             </Box>
                          ))}
                  </Box>
               </Stack>
            </Box>
         )}
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
   events: LiveStreamEvent[]
   seeMoreLink?: string
   title?: string
   loading: boolean
   limit: number
   hidePreview?: boolean
   type: EventsTypes
   id?: string
   isEmpty?: boolean
}

export default EventsPreview
