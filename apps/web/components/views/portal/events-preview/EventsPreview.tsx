import React, { useCallback, useMemo, useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import EventPreviewCard from "../../common/stream-cards/EventPreviewCard"
import Link from "next/link"
import RegistrationModal from "components/views/common/registration-modal"
import { useRouter } from "next/router"
import useRegistrationModal from "../../../custom-hook/useRegistrationModal"
import { useTheme } from "@mui/material/styles"
import Stack from "@mui/material/Stack"
import useMediaQuery from "@mui/material/useMediaQuery"
import Heading from "../common/Heading"
import { useInterests } from "../../../custom-hook/useCollection"
import EmptyMessageOverlay from "./EmptyMessageOverlay"
import ShareLivestreamModal from "../../common/ShareLivestreamModal"
import CustomButtonCarousel from "../../common/carousels/CustomButtonCarousel"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { MARKETING_LANDING_PAGE_PATH } from "../../../../constants/routes"

const styles = {
   carousel: {
      "& .slick-slide": {
         "& > *": {
            display: "flex",
         },
      },
   },
   eventsHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      px: 2,
   },
   seeMoreText: {
      color: "text.secondary",
      fontSize: "1.2rem",
      fontWeight: 600,
   },
   previewContent: {
      position: "relative",
   },
} as const

const EventsPreview = ({
   title,
   seeMoreLink,
   loading,
   limit = 0,
   events,
   hidePreview,
   type,
   id,
   isEmpty,
}: EventsProps) => {
   const {
      query: { groupId },
      pathname,
   } = useRouter()
   const { joinGroupModalData, handleCloseJoinModal, handleClickRegister } =
      useRegistrationModal()
   const { data: existingInterests } = useInterests()

   const {
      breakpoints: { up },
   } = useTheme()
   const isMedium = useMediaQuery(up("md"))
   const isLarge = useMediaQuery(up("lg"))
   const [shareEventDialog, setShareEventDialog] = useState(null)

   const handleShareEventDialogClose = useCallback(() => {
      setShareEventDialog(null)
   }, [setShareEventDialog])
   const numSlides: number = useMemo(() => {
      return isLarge ? 3 : isMedium ? 2 : 1
   }, [isMedium, isLarge])
   const numLoadingSlides = numSlides + 2
   const numElements = numSlides
   const numChildrenElements = loading ? numLoadingSlides : events?.length

   const [cardsLoaded, setCardsLoaded] = useState({})
   const shouldCenter = false

   const isOnMarketingLandingPage = pathname.includes(
      MARKETING_LANDING_PAGE_PATH
   )

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
                  {isOnMarketingLandingPage ? (
                     <Heading
                        sx={{
                           opacity: "unset",
                           color: "unset",
                           fontWeight: 500,
                        }}
                        variant={"h2"}
                     >
                        {title}
                     </Heading>
                  ) : (
                     <Heading>{title}</Heading>
                  )}
                  {events?.length >= limit &&
                     !isOnMarketingLandingPage &&
                     seeMoreLink && (
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
                        showButton={!isOnMarketingLandingPage}
                     />
                  )}
                  <CustomButtonCarousel
                     numChildren={numChildrenElements}
                     numSlides={numElements}
                     shouldCenter={shouldCenter}
                     carouselProps={{
                        onLazyLoad: handleCardsLoaded,
                        initialSlide: 0,
                        lazyLoad: true,
                        centerMode: shouldCenter,
                        infinite: shouldCenter,
                     }}
                     carouselStyles={styles.carousel}
                  >
                     {loading
                        ? [...Array(numLoadingSlides)].map((_, i) => (
                             <Box key={i} sx={{ px: { xs: 1, sm: 1 } }}>
                                <EventPreviewCard
                                   animation={isEmpty ? false : undefined}
                                   loading
                                />
                             </Box>
                          ))
                        : events.map((event, index, arr) => (
                             <Box key={event.id} sx={{ px: { xs: 1, sm: 1 } }}>
                                <EventPreviewCard
                                   loading={
                                      !cardsLoaded[index] &&
                                      !cardsLoaded[arr.length - (index + 1)]
                                   }
                                   interests={existingInterests}
                                   autoRegister
                                   openShareDialog={setShareEventDialog}
                                   onRegisterClick={handleClickRegister}
                                   key={event.id}
                                   event={event}
                                />
                             </Box>
                          ))}
                  </CustomButtonCarousel>
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
         {shareEventDialog && (
            <ShareLivestreamModal
               livestreamData={shareEventDialog}
               handleClose={handleShareEventDialogClose}
            />
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
   /**
    * Events that have already happened
    */
   pastEvents = "pastEvents",
}

export interface EventsProps {
   events: LivestreamEvent[]
   seeMoreLink?: string
   title?: string
   loading: boolean
   limit?: number
   hidePreview?: boolean
   type: EventsTypes | string
   id?: string
   isEmpty?: boolean
}

export default EventsPreview
