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
import {
   Typography,
   Stack,
   useMediaQuery,
   useTheme,
   SxProps,
   IconButton,
} from "@mui/material"
import EventPreviewCard from "components/views/common/stream-cards/EventPreviewCard"
import Link from "next/link"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import useIsMobile from "components/custom-hook/useIsMobile"
import { ArrowLeft, ArrowRight } from "react-feather"
import ConditionalWrapper from "components/util/ConditionalWrapper"

const slideSpacing = 21
const desktopSlideWidth = 322 + slideSpacing
const mobileSlideWidth = 302 + slideSpacing

const styles = sxStyles({
   arrowIcon: {
      padding: 0,
      minHeight: { xs: "25px", md: "30px" },
      minWidth: { xs: "25px", md: "30px" },
      ml: 2,
   },
   eventsHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      pr: 2,
      pb: 0.5,
   },
   description: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 2,
   },
   seeMoreText: {
      color: "text.secondary",
      textDecoration: "underline",
      pr: 1,
   },
   underlined: {
      textDecoration: "underline",
   },
   eventTitle: {
      fontFamily: "Poppins",
      fontSize: "18px",
      fontStyle: "normal",
      fontWeight: "600",
      lineHeight: "27px",
      color: "black",
   },
   viewport: {
      overflow: "hidden",
   },
   container: {
      backfaceVisibility: "hidden",
      display: "flex",
      touchAction: "pan-y",
   },
   slide: {
      flex: {
         xs: `0 0 ${mobileSlideWidth}px`,
         md: `0 0 ${desktopSlideWidth}px`,
      },
      minWidth: 0,
      position: "relative",
      height: {
         xs: 363,
         md: 363,
      },
      "&:not(:first-child)": {
         paddingLeft: `calc(${slideSpacing}px - 5px)`,
      },
   },
   paddingSlide: {
      flex: `0 0 ${slideSpacing}px`,
   },
   previewContent: {
      position: "relative",
   },
   mainBox: {
      paddingLeft: 2,
   },
   titleLink: {
      color: "#000",
      "&:hover": {
         color: "#000",
      },
   },
})

const wheelGesturesOptions = {
   wheelDraggingClass: "is-wheel-dragging",
}
const defaultStyling: EventsCarouselStyling = {
   compact: true,
   seeMoreSx: styles.seeMoreText,
   eventTitleSx: styles.eventTitle,
   viewportSx: styles.viewport,
   showArrows: false,
   headerAsLink: false,
   padding: true,
   slide: styles.slide,
   title: styles.eventTitle,
   titleVariant: "h6",
   eventsHeader: styles.eventsHeader,
}
const defaultEmblaOptions: EmblaOptionsType = {
   axis: "x",
   loop: false,
   align: "center",
   dragThreshold: 0.5,
   dragFree: true,
   inViewThreshold: 0,
}
const EventsPreviewCarousel = React.forwardRef<ChildRefType, EventsProps>(
   (props, ref) => {
      const {
         title,
         seeMoreLink,
         loading = false,
         events,
         hidePreview,
         type,
         id,
         isEmpty,
         isRecommended,
         isEmbedded = false,
         children,
         options = defaultEmblaOptions,
         eventDescription,
         styling = defaultStyling,
      } = props

      const [emblaRef, emblaApi] = useEmblaCarousel(
         options,
         events?.length > 1 ? [WheelGesturesPlugin(wheelGesturesOptions)] : []
      )

      const isMobile = useIsMobile()

      const {
         breakpoints: { up },
      } = useTheme()
      const isMedium = useMediaQuery(up("md"))
      const isLarge = useMediaQuery(up("lg"))

      const numSlides: number = useMemo(() => {
         return isLarge ? 3 : isMedium ? 2 : 1
      }, [isMedium, isLarge])
      const numLoadingSlides = numSlides + 2

      React.useImperativeHandle(ref, () => ({
         goNext() {
            emblaApi.scrollNext()
         },
         goPrev() {
            emblaApi.scrollPrev()
         },
      }))

      const [cardsLoaded, setCardsLoaded] = useState({})

      const [slidesInView, setSlidesInView] = useState<number[]>([])

      const handleCardsLoaded = (cardsIndexLoaded: number[]) => {
         setCardsLoaded((prev) => ({
            ...prev,
            ...cardsIndexLoaded.reduce(
               (acc, curr) => ({ ...acc, [curr]: true }),
               {}
            ),
         }))
      }

      /**
       * Lazily load cards based on what is currently in view.
       * The @function handleCardsLoaded then updates the Events array based on the indexes which are
       * currently in view.
       */
      const updateSlidesInView = useCallback(
         (emblaApi: EmblaCarouselType) => {
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
         },
         [setSlidesInView]
      )

      useEffect(() => {
         if (!emblaApi) return

         updateSlidesInView(emblaApi)
         emblaApi.on("slidesInView", updateSlidesInView)
         emblaApi.on("reInit", updateSlidesInView)
      }, [emblaApi, updateSlidesInView])

      const seeMoreComponent = (
         <ConditionalWrapper
            condition={events?.length > 1 && seeMoreLink !== undefined}
         >
            <Link href={seeMoreLink}>
               <Typography sx={styling.seeMoreSx} color="grey">
                  See all
               </Typography>
            </Link>
         </ConditionalWrapper>
      )
      const arrowsComponent = (
         <ConditionalWrapper
            condition={emblaApi !== undefined && events?.length > 1}
         >
            <Stack direction={"row"}>
               <IconButton
                  color="inherit"
                  sx={styles.arrowIcon}
                  onClick={() => {
                     if (emblaApi.canScrollPrev()) emblaApi.scrollPrev()
                  }}
               >
                  <ArrowLeft fontSize={"large"} />
               </IconButton>
               <IconButton
                  color="inherit"
                  sx={styles.arrowIcon}
                  onClick={() => {
                     if (emblaApi.canScrollNext()) emblaApi.scrollNext()
                  }}
               >
                  <ArrowRight fontSize={"large"} />
               </IconButton>
            </Stack>
         </ConditionalWrapper>
      )

      const getLoadingCard = () => {
         return (
            <>
               {[...Array(numLoadingSlides)].map((_, i) => (
                  <Box key={i} sx={styling.slide}>
                     <EventPreviewCard
                        animation={isEmpty ? false : undefined}
                        loading
                     />
                  </Box>
               ))}
            </>
         )
      }
      const getHeading = (headingStyles: SxProps, variant?: any) => {
         return (
            <Typography
               variant={variant ? variant : "h6"}
               sx={headingStyles}
               fontWeight={"600"}
               color="black"
            >
               {title}
            </Typography>
         )
      }
      return (
         <>
            <ConditionalWrapper condition={!hidePreview}>
               <Box sx={styling.padding ? styles.mainBox : null}>
                  {
                     <ConditionalWrapper
                        condition={!isEmbedded && styling.compact}
                     >
                        <Box sx={styling.eventsHeader}>
                           <Box sx={styling.eventsHeader}>
                              <ConditionalWrapper
                                 condition={
                                    seeMoreLink !== undefined &&
                                    styling.headerAsLink
                                 }
                                 fallback={getHeading(
                                    [styling.title],
                                    styling.titleVariant
                                 )}
                              >
                                 <Link
                                    href={seeMoreLink}
                                    style={styles.titleLink}
                                 >
                                    {getHeading(
                                       [styling.title, styles.underlined],
                                       styling.titleVariant
                                    )}
                                 </Link>
                              </ConditionalWrapper>
                           </Box>
                           <ConditionalWrapper
                              condition={styling.showArrows}
                              fallback={seeMoreComponent}
                           >
                              {arrowsComponent}
                           </ConditionalWrapper>
                        </Box>
                     </ConditionalWrapper>
                  }
                  {
                     <ConditionalWrapper
                        condition={!isEmbedded && !styling.compact}
                     >
                        <Box sx={styling.eventsHeader}>
                           <Typography
                              variant={
                                 styling.titleVariant
                                    ? styling.titleVariant
                                    : "h6"
                              }
                              sx={styling.title}
                              fontWeight={"600"}
                              color="black"
                           >
                              {title}
                           </Typography>
                        </Box>
                     </ConditionalWrapper>
                  }
                  <Stack sx={styles.previewContent}>
                     {
                        <ConditionalWrapper
                           condition={
                              !isMobile &&
                              eventDescription !== undefined &&
                              eventDescription.length > 0
                           }
                        >
                           <Stack>
                              <Box sx={styles.description}>
                                 <Typography
                                    variant="h6"
                                    fontWeight={"400"}
                                    color="textSecondary"
                                 >
                                    {eventDescription}
                                 </Typography>
                              </Box>
                           </Stack>
                        </ConditionalWrapper>
                     }
                     {
                        <ConditionalWrapper
                           condition={!isEmbedded && !styling.compact}
                        >
                           <Stack
                              direction="row"
                              spacing={2}
                              justifyContent="space-between"
                              alignItems="center"
                              mt={1}
                              mb={1}
                           >
                              <Box>{seeMoreComponent}</Box>
                              {arrowsComponent}
                           </Stack>
                        </ConditionalWrapper>
                     }
                     {
                        <Box id={id} sx={styling.viewportSx} ref={emblaRef}>
                           <Box sx={[styles.container]}>
                              <ConditionalWrapper
                                 condition={!loading}
                                 fallback={getLoadingCard()}
                              >
                                 <ConditionalWrapper
                                    condition={events?.length > 0}
                                    fallback={children}
                                 >
                                    {events.map((event, index, arr) => (
                                       <Box sx={styling.slide} key={event.id}>
                                          <EventPreviewCard
                                             key={event.id}
                                             loading={
                                                (loading &&
                                                   !cardsLoaded[index] &&
                                                   !cardsLoaded[
                                                      arr.length - (index + 1)
                                                   ]) ||
                                                false
                                             }
                                             index={index}
                                             totalElements={arr.length}
                                             location={getLocation(type)}
                                             event={event}
                                             isRecommended={isRecommended}
                                          />
                                       </Box>
                                    ))}
                                 </ConditionalWrapper>
                              </ConditionalWrapper>
                              {/**
                               * This prevents the last slide from touching the right edge of the viewport.
                               */}
                              <ConditionalWrapper
                                 condition={events?.length > 0}
                              >
                                 <Box sx={styles.paddingSlide}></Box>
                              </ConditionalWrapper>
                           </Box>
                        </Box>
                     }
                  </Stack>
               </Box>
            </ConditionalWrapper>
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

export type EventsCarouselStyling = {
   compact?: boolean
   seeMoreSx?: SxProps
   eventTitleSx?: SxProps
   viewportSx?: SxProps
   showArrows?: boolean
   headerAsLink?: boolean
   padding?: boolean
   slide?: SxProps
   title?: SxProps
   titleVariant?: any
   eventsHeader?: SxProps
}
export type ChildRefType = {
   goNext: () => void
   goPrev: () => void
}

export type EventsProps = {
   events: LivestreamEvent[]
   eventDescription?: string
   seeMoreLink?: string
   title?: string
   loading?: boolean
   hidePreview?: boolean
   type: EventsTypes
   id?: string
   isEmpty?: boolean
   isRecommended?: boolean
   isEmbedded?: boolean
   options?: EmblaOptionsType
   children?: ReactNode
   isAdmin?: boolean
   styling?: EventsCarouselStyling
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
