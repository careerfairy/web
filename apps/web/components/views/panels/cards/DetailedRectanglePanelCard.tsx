import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Box, Typography } from "@mui/material"
import { useUserIsRegistered } from "components/custom-hook/live-stream/useUserIsRegistered"
import useGroupsByIds from "components/custom-hook/useGroupsByIds"
import { sxStyles } from "types/commonTypes"
import {
   PanelCardBase,
   PanelDateBadge,
   PanelHostAvatars,
   PanelRegistrationStatus,
   PanelTitleImage,
} from "./base/PanelCardBase"

const CARD_HEIGHT = 275

const styles = sxStyles({
   root: {
      height: `${CARD_HEIGHT}px`,
   },
   topSection: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      p: 1.5,
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "flex-start",
   },
   leftSection: {
      position: "absolute",
      top: "50%",
      maxWidth: "50%",
      height: "100%",
      p: 3,
      transform: "translateY(-50%)",
      display: "flex",
      flexDirection: "column",
      gap: 2,
      alignItems: "flex-start",
      justifyContent: "space-between",
   },
   bottomRightSection: {
      position: "absolute",
      bottom: 12,
      right: 12,
      display: "flex",
      flexDirection: "column",
      gap: 1,
      alignItems: "flex-end",
   },
   dateBadgeOverride: {
      position: "static",
      top: "auto",
      right: "auto",
   },
   titleImageOverride: {
      position: "static",
      bottom: "auto",
      left: "auto",
      width: "153px",
      height: "62px",
   },
   titleImageContainer: {
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
      width: "192px",
      height: "75px",
   },
   hostsContainer: {
      display: "flex",
      gap: 0.5,
      alignItems: "center",
   },
   eventTitle: {
      color: (theme) => theme.brand.white[100],
      display: "-webkit-box",
      WebkitLineClamp: 3,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
      textOverflow: "ellipsis",
      maxWidth: "100%",
   },
})

type DetailedRectanglePanelCardProps = {
   event: LivestreamEvent
}

export const DetailedRectanglePanelCard = ({
   event,
}: DetailedRectanglePanelCardProps) => {
   const isRegistered = useUserIsRegistered(event.id)

   const { data: groups } = useGroupsByIds(event.groupIds, false)

   const hostLogos =
      groups?.map((group) => group.logoUrl)?.filter(Boolean) ?? []

   return (
      <PanelCardBase
         event={event}
         rootSx={styles.root}
         backgroundSx={{
            "&::before": {
               background: `
                  linear-gradient(90deg, rgb(10, 8, 3) 37.547%, rgba(10, 8, 3, 0) 67.067%),
                  linear-gradient(90deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.1) 100%),
                  linear-gradient(rgba(0, 0, 0, 0) 65.561%, rgba(0, 0, 0, 0.8) 100%)
               `,
            },
            "&::after": {
               background: "none",
            },
         }}
      >
         <Box>
            <Box sx={styles.topSection}>
               <Box sx={styles.dateBadgeOverride}>
                  <PanelDateBadge
                     startDate={event.start?.toDate()}
                     variant="default"
                  />
               </Box>
            </Box>

            <Box sx={styles.leftSection}>
               <Box sx={styles.titleImageContainer}>
                  <PanelTitleImage
                     imageUrl={event.panelLogoUrl}
                     sx={styles.titleImageOverride}
                  />
               </Box>

               {event.summary ? (
                  <Typography variant="medium" sx={styles.eventTitle}>
                     {event.summary}
                  </Typography>
               ) : null}

               <Box sx={styles.hostsContainer}>
                  <PanelHostAvatars size={36} logoUrls={hostLogos} />
               </Box>
            </Box>

            <Box sx={styles.bottomRightSection}>
               <PanelRegistrationStatus isRegistered={isRegistered} />
            </Box>
         </Box>
      </PanelCardBase>
   )
}
