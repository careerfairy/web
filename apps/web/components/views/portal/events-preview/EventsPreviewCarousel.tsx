import {
   ImpressionLocation,
   LivestreamEvent,
} from "@careerfairy/shared-lib/livestreams"
import {
   Button,
   Stack,
   SxProps,
   Typography,
   TypographyProps,
   useMediaQuery,
   useTheme,
} from "@mui/material"
import Box from "@mui/material/Box"
import useIsMobile from "components/custom-hook/useIsMobile"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import { GenericCarousel } from "components/views/common/carousels/GenericCarousel"
import EventPreviewCard from "components/views/common/stream-cards/EventPreviewCard"
import { useLivestreamRouting } from "components/views/group/admin/events/useLivestreamRouting"
import useEmblaCarousel, { EmblaOptionsType } from "embla-carousel-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import Link from "next/link"
import React, { ReactNode, useMemo } from "react"
import { sxStyles } from "types/commonTypes"

const slideSpacing = 21

const styles = sxStyles({
   eventsHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      pr: 2,
   },
   description: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 2,
   },
   seeMoreText: (theme) => ({
      color: theme.palette.neutral[600],
      textDecoration: "underline",
      pr: 1,
      ":hover": {
         color: theme.palette.neutral[800],
      },
   }),
   underlined: {
      textDecoration: "underline",
   },
   eventTitle: {
      fontWeight: "600",
      color: (theme) => theme.palette.neutral[800],
   },
   viewport: {
      overflow: "hidden",
      // hack to ensure overflow visibility with parent padding
      padding: "16px",
      marginX: "-16px",
      width: "calc(100% + 16px)",
   },
   container: {
      backfaceVisibility: "hidden",
      display: "flex",
      touchAction: "pan-y",
   },
   slide: {
      flex: {
         xs: `0 0 90%`,
         sm: `0 0 55%`,
         md: `0 0 45%`,
         lg: `0 0 35%`,
      },
      maxWidth: "368px",
      minWidth: "300px",
      position: "relative",

      "&:not(:first-of-type)": {
         ml: `calc(${slideSpacing}px - 5px)`,
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
      mb: 3,
   },
   titleLink: {
      color: "#000",
      "&:hover": {
         color: "#000",
      },
   },
   manageBtn: {
      borderRadius: 10,
      mx: "auto",
      py: (theme) => `${theme.spacing(0.75)} !important`,
      boxShadow: "none",
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
   titleVariant: "brandedH4",
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
   JOB_EVENTS = "jobLinkedEvents",
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
   titleVariant?: TypographyProps["variant"]
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
   showManageButton?: boolean
   hideChipLabels?: boolean
   handleOpenEvent?: (event: LivestreamEvent) => void
   disableClick?: boolean
   onCardClick?: (event) => void
   disableTracking?: boolean
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
         hideChipLabels,
         showManageButton = false,
         handleOpenEvent,
         disableClick,
         onCardClick,
         disableTracking,
      } = props

      const allStyles = { ...defaultStyling, ...styling }

      const emblaPlugins = []
      if (events?.length)
         emblaPlugins.push(WheelGesturesPlugin(wheelGesturesOptions))

      const [emblaRef, emblaApi] = useEmblaCarousel(options, emblaPlugins)

      const isMobile = useIsMobile()
      const { editLivestream, livestreamCreationFlowV2 } =
         useLivestreamRouting()

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
               <Typography sx={allStyles.seeMoreSx}>See all</Typography>
            </Link>
         </ConditionalWrapper>
      )
      const arrowsComponent = (
         <ConditionalWrapper
            condition={emblaApi !== undefined && events?.length > 1}
         >
            <GenericCarousel.Arrows emblaApi={emblaApi} />
         </ConditionalWrapper>
      )

      const getLoadingCard = () => {
         return (
            <>
               {[...Array(numLoadingSlides)].map((_, i) => (
                  <Box key={i} sx={allStyles.slide}>
                     <EventPreviewCard
                        animation={isEmpty ? false : undefined}
                        loading
                     />
                  </Box>
               ))}
            </>
         )
      }
      const getHeading = (
         headingStyles: SxProps,
         variant?: TypographyProps["variant"]
      ) => {
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
      const mainBoxSxStyles = [allStyles.mainWrapperBoxSx]
      allStyles.padding && mainBoxSxStyles.push(styles.mainBox)

      return (
         <>
            <ConditionalWrapper condition={!hidePreview}>
               <Box sx={mainBoxSxStyles}>
                  <ConditionalWrapper
                     condition={!isEmbedded && allStyles.compact}
                  >
                     <Box sx={allStyles.eventsHeader}>
                        <Box>
                           <ConditionalWrapper
                              condition={
                                 seeMoreLink !== undefined &&
                                 (allStyles.headerAsLink || isMobile)
                              }
                              fallback={getHeading(
                                 [allStyles.title],
                                 allStyles.titleVariant
                              )}
                           >
                              <Link href={seeMoreLink} style={styles.titleLink}>
                                 {getHeading(
                                    [allStyles.title, styles.underlined],
                                    allStyles.titleVariant
                                 )}
                              </Link>
                           </ConditionalWrapper>
                        </Box>
                        <Stack
                           spacing={1}
                           direction={"row"}
                           justifyContent="space-between"
                           alignItems="flex-end"
                        >
                           <ConditionalWrapper
                              condition={!allStyles.headerAsLink && !isMobile}
                           >
                              {seeMoreComponent}
                           </ConditionalWrapper>
                           {(!isMobile && arrowsComponent) || null}
                        </Stack>
                     </Box>
                  </ConditionalWrapper>

                  <ConditionalWrapper
                     condition={!isEmbedded && !allStyles.compact}
                  >
                     <Box sx={allStyles.eventsHeader}>
                        <Typography
                           variant={allStyles.titleVariant}
                           sx={allStyles.title}
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
                        condition={!isEmbedded && !allStyles.compact}
                     >
                        <Stack
                           direction="row"
                           spacing={2}
                           justifyContent="space-between"
                           alignItems="flex-end"
                           mt={1}
                           mb={1}
                        >
                           <Box>{seeMoreComponent}</Box>
                           {arrowsComponent}
                        </Stack>
                     </ConditionalWrapper>
                     <Box id={id} sx={allStyles.viewportSx} ref={emblaRef}>
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
                                    <Box sx={allStyles.slide} key={event.id}>
                                       <EventPreviewCard
                                          key={event.id}
                                          loading={loading}
                                          index={index}
                                          totalElements={arr.length}
                                          location={getLocation(type)}
                                          event={event}
                                          isRecommended={isRecommended}
                                          hideChipLabels={hideChipLabels}
                                          disableClick={disableClick}
                                          disableTracking={disableTracking}
                                          onCardClick={
                                             onCardClick
                                                ? () => onCardClick(event)
                                                : null
                                          }
                                          bottomElement={
                                             showManageButton ? (
                                                <Box
                                                   display="flex"
                                                   justifyContent="center"
                                                   flexDirection="column"
                                                   component="span"
                                                   width="100%"
                                                   px={1}
                                                >
                                                   <Button
                                                      variant="contained"
                                                      component="a"
                                                      href="#"
                                                      color="primary"
                                                      onClick={(e) => {
                                                         e.stopPropagation()
                                                         if (
                                                            livestreamCreationFlowV2
                                                         ) {
                                                            return editLivestream(
                                                               event.id
                                                            )
                                                         } else {
                                                            return handleOpenEvent(
                                                               event
                                                            )
                                                         }
                                                      }}
                                                      fullWidth
                                                      size="small"
                                                      sx={styles.manageBtn}
                                                   >
                                                      MANAGE LIVE STREAM
                                                   </Button>
                                                </Box>
                                             ) : null
                                          }
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

EventsPreviewCarousel.displayName = "EventsPreviewCarousel"

export default EventsPreviewCarousel
