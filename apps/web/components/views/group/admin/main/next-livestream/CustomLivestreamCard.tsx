import { ImpressionLocation, LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Box, Stack } from "@mui/material"
import { forwardRef } from "react"
import { sxStyles } from "types/commonTypes"
import { EventPreviewCardProvider, AdditionalContextProps } from "components/views/common/stream-cards/EventPreviewCardContext"
import { useInView } from "react-intersection-observer"
import { useUserIsRegistered } from "components/custom-hook/live-stream/useUserIsRegistered"
import { checkIfPast } from "util/streamUtil"

// Import the internal components from the correct files
import { HeroPreview } from "components/views/common/stream-cards/EventPreviewCardHero"
import { CompanyName, Title, Summary } from "components/views/common/stream-cards/EventPreviewCardContent"

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
})

export type CustomLivestreamCardProps = {
   event?: LivestreamEvent
   location?: ImpressionLocation | string
   disableClick?: boolean
} & AdditionalContextProps

const CustomLivestreamCard = forwardRef<HTMLDivElement, CustomLivestreamCardProps>(
   ({ event, location = ImpressionLocation.unknown, disableClick, ...additionalProps }, ref) => {
      const { inView: cardInView, ref: cardInViewRef } = useInView({
         fallbackInView: true,
         threshold: 0.9,
      })

      const hasRegistered = useUserIsRegistered(event?.id, {
         disabled: !cardInView,
      })

      const isPast = checkIfPast(event)
      const isPlaceholderEvent = event?.id.includes("placeholderEvent")

      return (
         <Box>
            <EventPreviewCardProvider
               event={event}
               livestream={event}
               isPlaceholderEvent={isPlaceholderEvent}
               hasRegistered={hasRegistered}
               cardInView={cardInView}
               cardInViewRef={cardInViewRef}
               isPast={isPast}
               {...additionalProps}
            >
               <Box
                  ref={ref}
                  sx={styles.mainAndLowerContentWrapper}
               >
                  <Stack sx={styles.mainContentWrapper}>
                     <HeroPreview />

                     <Stack sx={styles.contentWrapper} gap={2}>
                        <CompanyName />

                        {/* Description without labels */}
                        <Stack sx={styles.descriptionWrapper}>
                           <Stack width="-webkit-fill-available" spacing={1}>
                              <Title />
                              <Summary />
                           </Stack>
                           {/* EventPreviewCardAboutLabels removed here */}
                        </Stack>
                     </Stack>
                  </Stack>
               </Box>
            </EventPreviewCardProvider>
         </Box>
      )
   }
)

CustomLivestreamCard.displayName = "CustomLivestreamCard"

export default CustomLivestreamCard