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
import Heading from "../common/Heading"
import Link from "next/link"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import useIsMobile from "components/custom-hook/useIsMobile"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import { ArrowLeft, ArrowRight } from "react-feather"

const slideSpacing = 21
const desktopSlideWidth = 322 + slideSpacing
const mobileSlideWidth = 321 + slideSpacing

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
      px: 2,
   },
   description: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      px: 2,
      paddingTop: 2,
   },
   seeMoreText: {
      color: "text.secondary",
      textDecoration: "underline",
   },
   eventTitle: {
      color: "#000000",
      opacity: 1,
      fontWeight: "bold",
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
         xs: 405,
         md: 375,
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

const wheelGesturesOptions = {
   wheelDraggingClass: "is-wheel-dragging",
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
         styling = {
            compact: true,
            seeMoreSx: styles.seeMoreText,
            eventTitleSx: styles.eventTitle,
            viewportSx: undefined,
            backgroundSx: undefined,
            showArrows: false,
         },
      } = props

      const [emblaRef, emblaApi] = useEmblaCarousel(options, [
         WheelGesturesPlugin(wheelGesturesOptions),
      ])
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
            condition={events?.length >= 0 && seeMoreLink !== undefined}
         >
            <Link href={seeMoreLink}>
               <Typography sx={styling.seeMoreSx} color="grey">
                  See all
               </Typography>
            </Link>
         </ConditionalWrapper>
      )
      const arrowsComponent = (
         <Box>
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
         </Box>
      )

      const getLoadingCard = () => {
         return (
            <>
               {[...Array(numLoadingSlides)].map((_, i) => (
                  <Box key={i} sx={styles.slide}>
                     <EventPreviewCard
                        animation={isEmpty ? false : undefined}
                        loading
                     />
                  </Box>
               ))}
            </>
         )
      }
      return (
         <>
            <ConditionalWrapper condition={!hidePreview}>
               <Box>
                  {
                     <ConditionalWrapper
                        condition={!isEmbedded && styling.compact}
                     >
                        <Box sx={styles.eventsHeader}>
                           {<Heading sx={styles.eventTitle}>{title}</Heading>}
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
                        <Box sx={styles.eventsHeader}>
                           {<Heading sx={styles.eventTitle}>{title}</Heading>}
                        </Box>
                     </ConditionalWrapper>
                  }
                  <Stack sx={styles.previewContent}>
                     {
                        <ConditionalWrapper condition={!isMobile}>
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
                              ml={2}
                              mt={1}
                           >
                              <Box>{seeMoreComponent}</Box>
                              {arrowsComponent}
                           </Stack>
                        </ConditionalWrapper>
                     }
                     {
                        <Box
                           id={id}
                           sx={[styles.viewport, styling.viewportSx]}
                           ref={emblaRef}
                        >
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
                                       <Box
                                          sx={styles.slide}
                                          key={"events-box-" + index}
                                       >
                                          <EventPreviewCard
                                             key={"event-preview-card-" + index}
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
                              <Box sx={styles.paddingSlide}></Box>
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
   backgroundSx?: SxProps
   showArrows?: boolean
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
