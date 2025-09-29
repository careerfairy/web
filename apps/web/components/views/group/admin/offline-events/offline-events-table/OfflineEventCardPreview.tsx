import { OfflineEventsWithStats } from "@careerfairy/shared-lib/offline-events/offline-events"
import { Box, Stack, Typography } from "@mui/material"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import { placeholderBanner } from "constants/images"
import Image from "next/image"
import { sxStyles } from "types/commonTypes"
import { OfflineEventHoverActionIcons } from "./OfflineEventHoverActionIcons"
import { OfflineEventStatus } from "./utils"

const styles = sxStyles({
   container: {
      display: "flex",
      gap: 1,
      minWidth: 300,
      height: 64, // Fixed height to match thumbnail
   },
   thumbnailImage: {
      borderRadius: "4px",
      objectFit: "cover",
      backgroundColor: "neutral.200",
      flexShrink: 0,
   },
   contentContainer: {
      flex: 1,
      minWidth: 0,
      height: 64, // Fixed height to prevent expansion
      overflow: "hidden", // Prevent overflow
      position: "relative",
   },
   titleTextDefault: {
      ...getMaxLineStyles(2), // 2 lines by default
   },
   titleTextHovered: {
      ...getMaxLineStyles(1), // 1 line when hovered
      overflow: "visible",
   },
   hoverActionsBackground: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 32,
      backgroundColor: (theme) => theme.brand.white[200],
      animation: "fadeInBackground 0.2s ease-in-out forwards",
      "@keyframes fadeInBackground": {
         "0%": {
            backgroundColor: (theme) => theme.brand.white[200],
         },
         "100%": {
            backgroundColor: (theme) => theme.brand.white[400],
         },
      },
   },
})

type Props = {
   stat: OfflineEventsWithStats
   showHoverActions?: boolean
   status: OfflineEventStatus
   onShareOfflineEvent?: () => void
   onAnalytics?: () => void
   onEdit?: () => void
}

export const OfflineEventCardPreview = ({
   stat,
   showHoverActions,
   onShareOfflineEvent,
   onAnalytics,
   onEdit,
}: Props) => {
   const isPublished = stat.offlineEvent.published

   return (
      <Stack
         direction="row"
         spacing={4}
         width="100%"
         justifyContent="space-between"
      >
         <Box sx={styles.container}>
            <Image
               src={stat.offlineEvent.backgroundImageUrl || placeholderBanner}
               alt={stat.offlineEvent.title || "Offline event thumbnail"}
               width={116}
               height={64}
               style={styles.thumbnailImage}
               quality={70}
               loading="lazy"
               sizes="116px"
            />
            <Stack
               sx={styles.contentContainer}
               py={showHoverActions ? undefined : 1}
               pt={showHoverActions ? 1 : undefined}
               justifyContent="space-between"
            >
               <Typography
                  variant="medium"
                  color="neutral.800"
                  fontWeight={400}
                  sx={[
                     showHoverActions
                        ? styles.titleTextHovered
                        : styles.titleTextDefault,
                  ]}
               >
                  {stat.offlineEvent.title || "Untitled"}
               </Typography>
               {Boolean(showHoverActions) && (
                  <Box sx={styles.hoverActionsBackground}>
                     <OfflineEventHoverActionIcons
                        isPublished={isPublished}
                        onShareOfflineEvent={onShareOfflineEvent}
                        onAnalytics={onAnalytics}
                        onEdit={onEdit}
                     />
                  </Box>
               )}
            </Stack>
         </Box>
      </Stack>
   )
}
