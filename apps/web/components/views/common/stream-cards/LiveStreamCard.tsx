import EventSEOSchemaScriptTag from "../EventSEOSchemaScriptTag"

import { ImpressionLocation } from "@careerfairy/shared-lib/livestreams"
import { alpha, CardActionArea } from "@mui/material"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import React, { forwardRef, useCallback } from "react"

import { gradientAnimation } from "materialUI/GlobalBackground/GlobalBackGround"
import { sxStyles } from "types/commonTypes"
import useTrackLivestreamImpressions from "../../../custom-hook/useTrackLivestreamImpressions"
import { EventPreviewCardProps } from "./EventPreviewCard"
import EventPreviewCardAboutLabels from "./EventPreviewCardAboutLabels"
import { CompanyName, Summary, Title } from "./EventPreviewCardContent"
import { useEventPreviewCardContext } from "./EventPreviewCardContext"
import { HeroPreview } from "./EventPreviewCardHero"

const bottomContentHeight = 50

const styles = sxStyles({
   contentWrapper: {
      display: "flex",
      width: "100%",
      flexDirection: "column",
      padding: "0px 16px 16px 16px",
      justifyContent: "flex-end",
      alignItems: "flex-start",
   },
   descriptionWrapper: {
      justifyContent: "space-between",
      alignItems: "flex-start",
      alignSelf: "stretch",
      height: "136px",
   },
   mainAndLowerContentWrapper: (theme) => ({
      borderRadius: theme.spacing(2),
      border: `1px solid ${theme.palette.secondary[50]}`,
      overflow: "hidden",
   }),
   selectedWrapper: {
      opacity: 0.5,
      backgroundImage: (theme) =>
         `linear-gradient(0deg, ${alpha(
            theme.palette.common.black,
            0.2
         )}, ${alpha(theme.palette.common.black, 0.1)})`,
   },
   mainContentWrapper: (theme) => ({
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      overflow: "hidden",
      width: "100%",
      background: theme.brand.white[50],
      "& .backgroundImage": {
         transition: theme.transitions.create(["transform"]),
      },
      "&:hover, &:focus-within": {
         "& .backgroundImage": {
            transform: "scale(1.1)",
         },
         background: theme.brand.white[100],
         borderColor: theme.palette.secondary[100],
         boxShadow: "0px 0px 12px 0px rgba(20, 20, 20, 0.08)",
      },
      ".MuiCardActionArea-focusHighlight": {
         background: "transparent",
      },
   }),

   cardIsLive: {
      background:
         "linear-gradient(white, white) padding-box, linear-gradient(180deg, #e9911d, #dc2743 50%, #e9911d) border-box",
      backgroundRepeat: "no-repeat",
      backgroundSize: "100% 100%, 100% 200%",
      backgroundPosition: "0 0, 0 100%",
      border: "4px solid transparent",
      animation: `${gradientAnimation} 1s infinite alternate`,
      maxHeight: 347,
   },
   cursorPointer: {
      cursor: "pointer",
   },
   cardWrapper: (theme) => ({
      color: theme.palette.action.active,
      height: "100%",
      borderRadius: theme.spacing(2),
   }),
})

const LiveStreamCard = forwardRef<HTMLDivElement, EventPreviewCardProps>(
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
         isLive,
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
            <Box
               ref={ref}
               sx={[
                  styles.mainAndLowerContentWrapper,
                  selected && styles.selectedWrapper,
                  isLive && styles.cardIsLive,
               ]}
            >
               <Stack sx={[styles.mainContentWrapper]}>
                  {selectInput || null}

                  <HeroPreview />

                  <Stack sx={styles.contentWrapper} gap={2}>
                     <CompanyName />

                     {/* Description and labels */}
                     <Stack sx={styles.descriptionWrapper}>
                        <Stack width="-webkit-fill-available" spacing={1}>
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

LiveStreamCard.displayName = "LiveStreamCard"

export default LiveStreamCard
