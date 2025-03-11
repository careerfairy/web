import { ImpressionLocation } from "@careerfairy/shared-lib/livestreams"
import { CardActionArea, Skeleton } from "@mui/material"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import { alpha } from "@mui/material/styles"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import React, { forwardRef, useCallback } from "react"
import { sxStyles } from "../../../../types/commonTypes"
import useTrackLivestreamImpressions from "../../../custom-hook/useTrackLivestreamImpressions"
import EventSEOSchemaScriptTag from "../EventSEOSchemaScriptTag"
import { EventPreviewCardProps } from "./EventPreviewCard"
import EventPreviewCardAboutLabels from "./EventPreviewCardAboutLabels"
import { CompanyName, Summary, Title } from "./EventPreviewCardContent"
import { useEventPreviewCardContext } from "./EventPreviewCardContext"
import { HeroRecording } from "./EventPreviewCardHero"

const bottomContentHeight = 50

const styles = sxStyles({
   contentWrapper: {
      display: "flex",
      width: "100%",
      flexDirection: "column",
      justifyContent: "flex-end",
      alignItems: "flex-start",
   },
   descriptionWrapper: {
      justifyContent: "space-between",
      alignItems: "flex-start",
      alignSelf: "stretch",
      height: "136px",
   },
   selectedWrapper: {
      opacity: 0.5,
      backgroundImage: (theme) =>
         `linear-gradient(0deg, ${alpha(
            theme.palette.common.black,
            0.2
         )}, ${alpha(theme.palette.common.black, 0.1)})`,
   },
   mainContentWrapper: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      overflow: "hidden",
      width: "100%",
   },
   cursorPointer: {
      cursor: "pointer",
   },
   cardWrapper: {
      color: "transparent",
      minWidth: "300px",
      height: "100%",
   },
})

const RecordingCard = forwardRef<HTMLDivElement, EventPreviewCardProps>(
   (
      {
         isRecommended,
         totalElements,
         index,
         location = ImpressionLocation.unknown,
         disableClick,
         onCardClick,
         selectInput,
         selected,
         disableTracking,
      },
      ref
   ) => {
      const {
         livestream: event,
         loading,
         bottomElement,
         isPlaceholderEvent,
         cardInViewRef,
      } = useEventPreviewCardContext()

      const trackImpressionsRef = useTrackLivestreamImpressions({
         event,
         isRecommended,
         positionInResults: index,
         numberOfResults: totalElements,
         location,
         disableTracking: isPlaceholderEvent || disableTracking,
      })

      const handleDetailsClick = useCallback(
         (e: React.MouseEvent<HTMLElement>) => {
            onCardClick?.(e)
         },
         [onCardClick]
      )

      return (
         <CardActionArea
            sx={[event && styles.cursorPointer, styles.cardWrapper]}
            ref={(e) => {
               trackImpressionsRef(e)
               cardInViewRef(e)
            }}
            onClick={handleDetailsClick}
            data-testid={`livestream-card-${event?.id}`}
            disabled={disableClick || loading}
            disableRipple={!event}
         >
            <Box ref={ref} sx={[selected && styles.selectedWrapper]}>
               <Stack sx={[styles.mainContentWrapper]}>
                  {selectInput || null}

                  <SuspenseWithBoundary
                     fallback={<Skeleton variant="rectangular" height={200} />}
                  >
                     <HeroRecording />
                  </SuspenseWithBoundary>

                  <Stack sx={[styles.contentWrapper]} gap={1}>
                     <CompanyName />

                     {/* Description and labels */}
                     <Stack sx={styles.descriptionWrapper}>
                        <Stack spacing={1}>
                           <Title />
                           <Summary />
                        </Stack>

                        <EventPreviewCardAboutLabels />
                     </Stack>
                  </Stack>

                  {/* Bottom element (manage button for admins) */}
                  {bottomElement ? (
                     <Box
                        bgcolor="background.paper"
                        width="100%"
                        display="flex"
                        height={bottomContentHeight}
                     >
                        {bottomElement}
                     </Box>
                  ) : null}
               </Stack>
            </Box>
            {event ? <EventSEOSchemaScriptTag event={event} /> : null}
         </CardActionArea>
      )
   }
)

RecordingCard.displayName = "RecordingCard"

export default RecordingCard
