import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import {
   Button,
   Stack,
   SxProps,
   Theme,
   Typography,
   TypographyProps,
   useMediaQuery,
   useTheme,
} from "@mui/material"
import Box from "@mui/material/Box"
import { useAutoPlayCarousel } from "components/custom-hook/embla-carousel/useAutoPlayCarousel"
import useIsMobile from "components/custom-hook/useIsMobile"
import { GenericCarousel } from "components/views/common/carousels/GenericCarousel"
import EventPreviewCard from "components/views/common/stream-cards/EventPreviewCard"
import { useLivestreamRouting } from "components/views/group/admin/events/useLivestreamRouting"
import { isLivestreamDialogOpen } from "components/views/livestream-dialog/LivestreamDialogLayout"
import useEmblaCarousel, { EmblaOptionsType } from "embla-carousel-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import Link from "next/link"

import { useRouter } from "next/router"
import React, { ReactNode, useCallback, useMemo } from "react"
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
   handleSeeMoreClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
   title?: ReactNode | string
   subtitle?: ReactNode | string
   header?: ReactNode
   loading?: boolean
   hidePreview?: boolean
   location: string
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
   disableClick?: boolean
   onCardClick?: (event) => void
   disableTracking?: boolean
   preventPaddingSlide?: boolean
   onClickSeeMore?: () => void
   disableAutoPlay?: boolean
}

const EventsPreviewCarousel = React.forwardRef<ChildRefType, EventsProps>(
   (props, ref) => {
      const {
         title,
         subtitle,
         seeMoreLink,
         handleSeeMoreClick,
         loading = false,
         events,
         hidePreview,
         location: type,
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
         disableClick,
         onCardClick,
         disableTracking,
         header,
         preventPaddingSlide = false,
         disableAutoPlay,
      } = props

      const allStyles = { ...defaultStyling, ...styling }

      const emblaPlugins = []
      if (events?.length)
         emblaPlugins.push(WheelGesturesPlugin(wheelGesturesOptions))

      const [emblaRef, emblaApi] = useEmblaCarousel(options, emblaPlugins)

      const isMobile = useIsMobile()
      const { query } = useRouter()
      const isLSDialogOpen = isLivestreamDialogOpen(query)
      const { editLivestream } = useLivestreamRouting()

      const {
         shouldDisableAutoPlay,
         moveToNextSlide,
         ref: autoPlayRef,
         muted,
         setMuted,
      } = useAutoPlayCarousel(events?.length ?? null, emblaApi)

      const {
         breakpoints: { up },
      } = useTheme()
      const isMedium = useMediaQuery(up("md"))
      const isLarge = useMediaQuery(up("lg"))

      const numSlides: number = useMemo(() => {
         return isLarge ? 3 : isMedium ? 2 : 1
      }, [isMedium, isLarge])
      const numLoadingSlides = numSlides + 2

      const handleSeeMoreLinkClick = useCallback(
         (e: React.MouseEvent<HTMLAnchorElement>) => {
            if (handleSeeMoreClick) {
               e.preventDefault()
               handleSeeMoreClick(e)
            }
         },
         [handleSeeMoreClick]
      )

      React.useImperativeHandle(ref, () => ({
         goNext() {
            emblaApi.scrollNext()
         },
         goPrev() {
            emblaApi.scrollPrev()
         },
      }))

      const seeMoreComponent =
         events?.length > 1 && seeMoreLink !== undefined ? (
            <Link href={seeMoreLink} onClick={handleSeeMoreLinkClick}>
               <Typography sx={allStyles.seeMoreSx}>See all</Typography>
            </Link>
         ) : null

      const arrowsComponent =
         emblaApi !== undefined && events?.length > 1 ? (
            <GenericCarousel.Arrows emblaApi={emblaApi} />
         ) : null

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
            {!hidePreview ? (
               <Box sx={mainBoxSxStyles}>
                  {header ? (
                     header
                  ) : !isEmbedded && allStyles.compact ? (
                     <Box sx={allStyles.eventsHeader}>
                        <Box>
                           {seeMoreLink !== undefined &&
                           (allStyles.headerAsLink || isMobile) ? (
                              <Link
                                 href={seeMoreLink}
                                 style={styles.titleLink}
                                 onClick={handleSeeMoreLinkClick}
                              >
                                 {getHeading(
                                    [allStyles.title, styles.underlined],
                                    allStyles.titleVariant
                                 )}
                              </Link>
                           ) : (
                              getHeading(
                                 [allStyles.title],
                                 allStyles.titleVariant
                              )
                           )}
                        </Box>
                        <Stack
                           spacing={1}
                           direction={"row"}
                           justifyContent="space-between"
                           alignItems="flex-end"
                        >
                           {!allStyles.headerAsLink && !isMobile
                              ? seeMoreComponent
                              : null}
                           {(!isMobile && arrowsComponent) || null}
                        </Stack>
                     </Box>
                  ) : null}

                  {!isEmbedded && !allStyles.compact ? (
                     <Box sx={allStyles.eventsHeader}>
                        {typeof title === "string" ? (
                           <Typography
                              variant={allStyles.titleVariant}
                              sx={allStyles.title}
                              fontWeight={"600"}
                              color="black"
                           >
                              {title}
                           </Typography>
                        ) : (
                           Boolean(title) && title
                        )}
                     </Box>
                  ) : null}
                  <Stack sx={styles.previewContent}>
                     {!isMobile &&
                     eventDescription !== undefined &&
                     eventDescription.length > 0 ? (
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
                     ) : null}
                     {!isEmbedded && !allStyles.compact ? (
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
                     ) : null}
                     {subtitle}
                     <Box ref={autoPlayRef}>
                        <Box id={id} sx={allStyles.viewportSx} ref={emblaRef}>
                           <Box sx={[styles.container]}>
                              {!loading ? (
                                 events?.length > 0 ? (
                                    events?.map((event, index, arr) => (
                                       <Box sx={allStyles.slide} key={event.id}>
                                          <EventPreviewCard
                                             loading={loading}
                                             index={index}
                                             totalElements={arr.length}
                                             location={type}
                                             event={event}
                                             isRecommended={isRecommended}
                                             hideChipLabels={hideChipLabels}
                                             disableClick={disableClick}
                                             disableTracking={disableTracking}
                                             onGoNext={moveToNextSlide}
                                             disableAutoPlay={
                                                isLSDialogOpen ||
                                                (disableAutoPlay &&
                                                   shouldDisableAutoPlay(index))
                                             }
                                             muted={muted}
                                             setMuted={setMuted}
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
                                                            return editLivestream(
                                                               event.id
                                                            )
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
                                    ))
                                 ) : (
                                    children
                                 )
                              ) : (
                                 <LoadingCards
                                    numSlides={numLoadingSlides}
                                    isEmpty={isEmpty}
                                    slideStyle={allStyles.slide}
                                 />
                              )}
                              {events?.length > 0 && !preventPaddingSlide ? (
                                 <Box sx={styles.paddingSlide}></Box>
                              ) : null}
                           </Box>
                        </Box>
                     </Box>
                  </Stack>
               </Box>
            ) : null}
         </>
      )
   }
)

type LoadingCardsProps = {
   numSlides: number
   isEmpty: boolean
   slideStyle: SxProps<Theme>
}

const LoadingCards = ({
   numSlides,
   isEmpty,
   slideStyle,
}: LoadingCardsProps) => {
   return (
      <>
         {[...Array(numSlides)].map((_, i) => (
            <Box key={i} sx={slideStyle}>
               <EventPreviewCard
                  animation={isEmpty ? false : undefined}
                  loading
               />
            </Box>
         ))}
      </>
   )
}

EventsPreviewCarousel.displayName = "EventsPreviewCarousel"

export default EventsPreviewCarousel
