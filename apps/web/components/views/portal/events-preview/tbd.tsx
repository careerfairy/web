import React, {
   ReactNode,
   useCallback,
   useEffect,
   useMemo,
   useState,
} from "react"
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
import {
   ImpressionLocation,
   LivestreamEvent,
} from "@careerfairy/shared-lib/livestreams"
import { MARKETING_LANDING_PAGE_PATH } from "../../../../constants/routes"
import useEmblaCarousel, {
   EmblaCarouselType,
   EmblaOptionsType,
} from "embla-carousel-react"

const slideSpacing = 21
const desktopSlideWidth = 306 + slideSpacing
const mobileSlideWidth = 280 + slideSpacing

const styles = {
   carousel: {
      "& .slick-slide": {
         "& > *": {
            display: "flex",
            px: { xs: 1, lg: "unset" },
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
   viewport: {
      overflow: "hidden",
   },
   container: {
      backfaceVisibility: "hidden",
      display: "flex",
      touchAction: "pan-y",
      marginLeft: `calc(${slideSpacing}px * -1)`,
   },
   slide: {
      flex: {
         xs: `0 0 ${mobileSlideWidth}px`,
         md: `0 0 ${desktopSlideWidth}px`,
      },
      minWidth: 0,
      paddingLeft: `${slideSpacing}px`,
      position: "relative",
      height: {
         xs: 405,
         md: 443,
      },
   },
   paddingSlide: {
      flex: `0 0 ${slideSpacing}px`,
   },
} as const
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
   // onItemClick?: (spark: LivestreamEvent) => void
   children?: ReactNode[]
   isAdmin?: boolean
}

const EventsPreviewCarousel = React.forwardRef<ChildRefType, EventsProps>(
   (
      {
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
         options,
      }: EventsProps,
      ref
   ) => {
      // const { options,  isAdmin } = props
      console.log("Embla Options: " + JSON.stringify(options))
      const [emblaRef, emblaApi] = useEmblaCarousel(options)

      const {
         query: { groupId },
         pathname,
      } = useRouter()

      const { joinGroupModalData, handleCloseJoinModal } =
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

      const [slidesInView, setSlidesInView] = useState<number[]>([])

      const numLoadingSlides = numSlides + 2
      const numElements = numSlides
      const numChildrenElements = loading ? numLoadingSlides : events?.length

      const [cardsLoaded, setCardsLoaded] = useState({})
      const shouldCenter = false

      const isOnMarketingLandingPage = pathname.includes(
         MARKETING_LANDING_PAGE_PATH
      )

      // Lazy loading not working for now
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

            inView.forEach((vIndex) => console.log("InView: " + vIndex))

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

      React.useImperativeHandle(ref, () => ({
         goNext() {
            emblaApi.scrollNext()
         },
         goPrev() {
            emblaApi.scrollPrev()
         },
      }))
      return (
         <>
            {!hidePreview ? (
               <Box id={id} sx={styles.viewport} ref={emblaRef}>
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
                              {title} - EMBLA
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
                  {/* LOADING HERE */}
                  {loading
                     ? // Change to emblaApi
                       [...Array(numLoadingSlides)].map((_, i) => (
                          <Box>
                             <EventPreviewCard
                                animation={isEmpty ? false : undefined}
                                loading
                             />
                          </Box>
                       ))
                     : events
                          // .map(e => { e.title = "WG-EMBLA".concat(e.title); return e;})
                          .map((event, index, arr) => (
                             <Stack>
                                <Box sx={styles.container}>
                                   <Box key={event.id} sx={styles.slide}>
                                      <EventPreviewCard
                                         key={index}
                                         loading={
                                            // !cardsLoaded[index] &&
                                            // !cardsLoaded[arr.length - (index + 1)] // Should be using Lazy loading
                                            false
                                         }
                                         index={index}
                                         totalElements={arr.length}
                                         interests={existingInterests}
                                         location={getLocation(type)}
                                         event={event}
                                         isRecommended={isRecommended}
                                      />
                                   </Box>
                                </Box>
                             </Stack>
                          ))}
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
