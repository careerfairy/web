import React, { ReactNode, useMemo } from "react"
import Box from "@mui/material/Box"
import useEmblaCarousel, { EmblaOptionsType } from "embla-carousel-react"
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
import { Variant } from "@mui/material/styles/createTypography"

const slideSpacing = 21

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
      pb: 1,
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
         xs: `0 0 90%`,
         sm: `0 0 45%`,
         md: `0 0 40%`,
         lg: `0 0 30%`,
      },

      minWidth: 0,
      position: "relative",
      height: {
         xs: 363,
         md: 363,
      },
      "&:not(:first-of-type)": {
         paddingLeft: `calc(${slideSpacing}px - 5px)`,
      },
      "&:first-of-type": {
         ml: 0.3,
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
   showArrows: true,
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
      const getHeading = (headingStyles: SxProps, variant?: Variant) => {
         return (
            <Typography
               variant={variant ? variant : "h6"} // Could be omitted since default is h6
               sx={headingStyles}
               fontWeight={"600"}
               color="black"
            >
               {title}
            </Typography>
         )
      }
      const mainBoxSxStyles = [styling.mainWrapperBoxSx]
      styling.padding && mainBoxSxStyles.push(styles.mainBox)

      return (
         <>
            <ConditionalWrapper condition={!hidePreview}>
               <Box sx={mainBoxSxStyles}>
                  <ConditionalWrapper
                     condition={!isEmbedded && styling.compact}
                  >
                     <Box sx={styling.eventsHeader}>
                        <Box>
                           <ConditionalWrapper
                              condition={
                                 seeMoreLink !== undefined &&
                                 (styling.headerAsLink || isMobile)
                              }
                              fallback={getHeading(
                                 [styling.title],
                                 styling.titleVariant
                              )}
                           >
                              <Link href={seeMoreLink} style={styles.titleLink}>
                                 {getHeading(
                                    [styling.title, styles.underlined],
                                    styling.titleVariant
                                 )}
                              </Link>
                           </ConditionalWrapper>
                        </Box>
                        <Stack
                           spacing={1}
                           direction={"row"}
                           justifyContent="space-between"
                           alignItems="center"
                        >
                           <ConditionalWrapper
                              condition={!styling.headerAsLink && !isMobile}
                           >
                              {seeMoreComponent}
                           </ConditionalWrapper>
                           {(!isMobile && arrowsComponent) || null}
                        </Stack>
                     </Box>
                  </ConditionalWrapper>

                  <ConditionalWrapper
                     condition={!isEmbedded && !styling.compact}
                  >
                     <Box sx={styling.eventsHeader}>
                        <Typography
                           variant={styling.titleVariant}
                           sx={styling.title}
                           fontWeight={"600"}
                           color="black"
                        >
                           {title}
                        </Typography>
                     </Box>
                  </ConditionalWrapper>
                  <Stack sx={styles.previewContent}>
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
                                 {events?.map((event, index, arr) => (
                                    <Box sx={styling.slide} key={event.id}>
                                       <EventPreviewCard
                                          key={event.id}
                                          loading={loading}
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
                           <ConditionalWrapper condition={events?.length > 0}>
                              <Box sx={styles.paddingSlide}></Box>
                           </ConditionalWrapper>
                        </Box>
                     </Box>
                  </Stack>
               </Box>
            </ConditionalWrapper>
         </>
      )
   }
)

const getLocation = (eventType: EventsTypes | string): ImpressionLocation => {
   switch (eventType) {
      case EventsTypes.MY_NEXT:
         return ImpressionLocation.myNextEventsCarousel
      case EventsTypes.PAST_EVENTS:
         return ImpressionLocation.pastEventsCarousel
      case EventsTypes.RECOMMENDED:
         return ImpressionLocation.recommendedEventsCarousel
      case EventsTypes.COMING_UP:
         return ImpressionLocation.comingUpCarousel
      case EventsTypes.COMING_UP_MARKETING:
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
   titleVariant?: Variant
   eventsHeader?: SxProps
   mainWrapperBoxSx?: unknown
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
   RECOMMENDED = "recommended",
   /**
    * Non specific upcoming events on careerfairy ordered closest start date
    */
   COMING_UP = "comingUp",
   /**
    * upcoming events on that user has registered to ordered closest start date
    */
   MY_NEXT = "myNext",
   /**
    * Events that have already happened
    */
   PAST_EVENTS = "pastEvents",
   /*
    * coming up marketing events
    * */
   COMING_UP_MARKETING = "comingUpMarketing",
}

EventsPreviewCarousel.displayName = "EventsPreviewCarousel"

export default EventsPreviewCarousel
