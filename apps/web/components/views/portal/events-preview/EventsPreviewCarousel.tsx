import React, {
   ReactNode,
   useCallback,
   useEffect,
   useMemo,
   useState,
} from "react"
import Box from "@mui/material/Box"
import useEmblaCarousel, {
   EmblaCarouselType,
   EmblaOptionsType,
} from "embla-carousel-react"
import { sxStyles } from "types/commonTypes"
import {
   ImpressionLocation,
   LivestreamEvent,
} from "@careerfairy/shared-lib/livestreams"
import { useRouter } from "next/router"
import useRegistrationModal from "components/custom-hook/useRegistrationModal"
import { useInterests } from "components/custom-hook/useCollection"
import { MARKETING_LANDING_PAGE_PATH } from "constants/routes"
import RegistrationModal from "components/views/common/registration-modal"
import { Typography, Stack, useMediaQuery, useTheme } from "@mui/material"
import ShareLivestreamModal from "components/views/common/ShareLivestreamModal"
import EventPreviewCard from "components/views/common/stream-cards/EventPreviewCard"
import Heading from "../common/Heading"
import EmptyMessageOverlay from "./EmptyMessageOverlay"
import Link from "next/link"

const slideSpacing = 21
const desktopSlideWidth = 322 + slideSpacing
const mobileSlideWidth = 321 + slideSpacing

const styles = sxStyles({
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

   viewport: {
      overflow: "hidden",
   },
   container: {
      backfaceVisibility: "hidden",
      display: "flex",
      touchAction: "pan-y",
      // marginLeft: `calc(${slideSpacing}px *-1)`,
      // marginLeft: `${slideSpacing}`,
   },
   slide: {
      flex: {
         xs: `0 0 ${mobileSlideWidth}px`,
         md: `0 0 ${desktopSlideWidth}px`,
      },
      minWidth: 0,
      position: "relative",
      height: {
         xs: 405,
         md: 443,
      },
      paddingLeft: `calc(${slideSpacing}px - 5px)`,
   },
   paddingSlide: {
      flex: `0 0 ${slideSpacing}px`,
   },
   previewContent: {
      position: "relative",
   },
})

export type ChildRefType = {
   goNext: () => void
   goPrev: () => void
}

export interface EventsProps {
   events: LivestreamEvent[]
   seeMoreLink?: string
   title?: string
   loading: boolean
   limit?: number
   hidePreview?: boolean
   type: EventsTypes
   id?: string
   isEmpty?: boolean
   isRecommended?: boolean
   isEmbedded?: boolean
   options?: EmblaOptionsType
   children?: ReactNode[]
   isAdmin?: boolean
}

const EventsPreviewCarousel = React.forwardRef<ChildRefType, EventsProps>(
   (props, ref) => {
      const {
         title,
         seeMoreLink,
         loading,
         limit = 0,
         events,
         hidePreview,
         type,
         id,
         isEmpty,
         isRecommended,
         isEmbedded = false,
         children,
         options,
      } = props
      const [emblaRef, emblaApi] = useEmblaCarousel(options)

      React.useImperativeHandle(ref, () => ({
         goNext() {
            emblaApi.scrollNext()
         },
         goPrev() {
            emblaApi.scrollPrev()
         },
      }))

      const {
         query: { groupId },
         pathname,
      } = useRouter()

      const { joinGroupModalData, handleCloseJoinModal } =
         useRegistrationModal()
      const { data: existingInterests } = useInterests()

      const [shareEventDialog, setShareEventDialog] = useState(null)

      const handleShareEventDialogClose = useCallback(() => {
         setShareEventDialog(null)
      }, [setShareEventDialog])

      const [cardsLoaded, setCardsLoaded] = useState({})

      const [slidesInView, setSlidesInView] = useState<number[]>([])

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
      const updateSlidesInView = useCallback((emblaApi: EmblaCarouselType) => {
         setSlidesInView((slidesInView) => {
            if (slidesInView.length === emblaApi.slideNodes().length) {
               emblaApi.off("slidesInView", updateSlidesInView)
            }
            const inView = emblaApi
               .slidesInView()
               .filter((index) => !slidesInView.includes(index))

            handleCardsLoaded(inView)

            return slidesInView.concat(inView)
         })
      }, [])

      useEffect(() => {
         if (!emblaApi) return

         updateSlidesInView(emblaApi)
         emblaApi.on("slidesInView", updateSlidesInView)
         emblaApi.on("reInit", updateSlidesInView)
      }, [emblaApi, updateSlidesInView])

      return (
         <>
            {!hidePreview ? (
               <Box>
                  {!isEmbedded ? (
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
                        seeMoreLink ? (
                           <Link href={seeMoreLink}>
                              <Typography sx={styles.seeMoreText} color="grey">
                                 See more
                              </Typography>
                           </Link>
                        ) : null}
                     </Box>
                  ) : null}
                  <Stack sx={styles.previewContent}>
                     {isEmpty ? (
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
                           targetBlank={isEmbedded}
                        />
                     ) : null}
                     <Box id={id} sx={styles.viewport} ref={emblaRef}>
                        <Box sx={styles.container}>
                           {events?.length
                              ? events.map((event, index, arr) => (
                                   <Box sx={styles.slide}>
                                      <EventPreviewCard
                                         key={index}
                                         loading={
                                            loading &&
                                            !cardsLoaded[index] &&
                                            !cardsLoaded[
                                               arr.length - (index + 1)
                                            ]
                                         }
                                         index={index}
                                         totalElements={arr.length}
                                         interests={existingInterests}
                                         location={getLocation(type)}
                                         event={event}
                                         isRecommended={isRecommended}
                                      />
                                   </Box>
                                ))
                              : children?.map((child, i) => (
                                   <Box key={i} sx={styles.slide}>
                                      {child}
                                   </Box>
                                ))}
                           {/**
                            * This prevents the last slide from touching the right edge of the viewport.
                            */}
                           <Box sx={styles.paddingSlide}></Box>
                        </Box>
                     </Box>
                  </Stack>
               </Box>
            ) : null}
            {!isEmbedded && joinGroupModalData ? (
               <RegistrationModal
                  isRecommended={isRecommended}
                  open={Boolean(joinGroupModalData)}
                  onFinish={handleCloseJoinModal}
                  promptOtherEventsOnFinal={!groupId}
                  livestream={joinGroupModalData?.livestream}
                  groups={joinGroupModalData?.groups}
                  targetGroupId={joinGroupModalData?.targetGroupId}
                  handleClose={handleCloseJoinModal}
               />
            ) : null}
            {!isEmbedded && shareEventDialog ? (
               <ShareLivestreamModal
                  livestreamData={shareEventDialog}
                  handleClose={handleShareEventDialogClose}
               />
            ) : null}
         </>
      )
   }
)
const getLocation = (eventType: EventsTypes | string): ImpressionLocation => {
   switch (eventType) {
      case EventsTypes.myNext:
         return ImpressionLocation.myNextEventsCarousel
      case EventsTypes.pastEvents:
         return ImpressionLocation.pastEventsCarousel
      case EventsTypes.recommended:
         return ImpressionLocation.recommendedEventsCarousel
      case EventsTypes.comingUp:
         return ImpressionLocation.comingUpCarousel
      case EventsTypes.comingUpMarketing:
         return ImpressionLocation.marketingPageCarousel
      default:
         return ImpressionLocation.unknown
   }
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
   /*
    * coming up marketing events
    * */
   comingUpMarketing = "comingUpMarketing",
}

EventsPreviewCarousel.displayName = "EventsPreviewCarousel"

export default EventsPreviewCarousel
