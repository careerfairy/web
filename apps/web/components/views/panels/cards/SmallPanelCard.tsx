/* eslint-disable @next/next/no-img-element */
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Box } from "@mui/material"
import { useUserIsRegistered } from "components/custom-hook/live-stream/useUserIsRegistered"
import { usePanelGroupsByIds } from "components/custom-hook/panels/usePanelGroupsByIds"
import { sxStyles } from "types/commonTypes"
import {
   PanelCardBase,
   PanelDateBadge,
   PanelHostAvatars,
   PanelRegistrationStatus,
} from "./base/PanelCardBase"

const CORNER_PADDING = 6
const CARD_MAX_WIDTH = 208
const CARD_MIN_HEIGHT = 119

const styles = sxStyles({
   content: {
      minWidth: `${CARD_MAX_WIDTH}px`,
      minHeight: `${CARD_MIN_HEIGHT}px`,
   },
   topLeftSection: {
      position: "absolute",
      top: `${CORNER_PADDING}px`,
      left: `${CORNER_PADDING}px`,
   },
   topRightSection: {
      position: "absolute",
      top: `${CORNER_PADDING}px`,
      right: `${CORNER_PADDING}px`,
   },
   bottomLeftSection: {
      position: "absolute",
      bottom: `${CORNER_PADDING}px`,
      left: `${CORNER_PADDING}px`,
   },
   bottomRightSection: {
      position: "absolute",
      bottom: `${CORNER_PADDING}px`,
      right: `${CORNER_PADDING}px`,
   },
   hostsContainer: {
      display: "flex",
      gap: 0.5,
      alignItems: "center",
   },
})

type SmallPanelCardProps = {
   event: LivestreamEvent
}

export const SmallPanelCard = ({ event }: SmallPanelCardProps) => {
   const isRegistered = useUserIsRegistered(event.id)

   const { data: groups } = usePanelGroupsByIds(event.groupIds)

   const hostLogos =
      groups?.map((group) => group.logoUrl)?.filter(Boolean) ?? []

   return (
      <PanelCardBase
         event={event}
         backgroundSx={{
            "&::before": {
               background: `
                  linear-gradient(90deg, rgba(10, 8, 3, 0.8) 0%, rgba(10, 8, 3, 0.4) 50%, rgba(10, 8, 3, 0) 100%),
                  linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.1) 100%),
                  linear-gradient(rgba(0, 0, 0, 0) 60%, rgba(0, 0, 0, 0.4) 100%)
               `,
            },
            "&::after": {
               background: "none",
            },
         }}
      >
         <Box sx={styles.content}>
            {/* Top Left - Date Badge */}
            <Box sx={styles.topLeftSection}>
               <PanelDateBadge
                  startDate={event.start?.toDate()}
                  variant="small"
               />
            </Box>

            {/* Top Right - Registration Status */}
            <Box sx={styles.topRightSection}>
               <PanelRegistrationStatus
                  isRegistered={isRegistered}
                  variant="small"
               />
            </Box>

            {/* Bottom Left - Panel Image */}
            <Box sx={styles.bottomLeftSection}>
               {event.panelLogoUrl ? (
                  <img
                     src={event.panelLogoUrl}
                     alt="Panel logo"
                     style={{
                        maxWidth: "80px", // Appropriate size for small card
                        height: "auto",
                        objectFit: "contain",
                        objectPosition: "bottom left",
                        display: "block",
                     }}
                  />
               ) : null}
            </Box>

            {/* Bottom Right - Host Avatars */}
            <Box sx={styles.bottomRightSection}>
               <Box sx={styles.hostsContainer}>
                  <PanelHostAvatars size={20} logoUrls={hostLogos} />
               </Box>
            </Box>
         </Box>
      </PanelCardBase>
   )
}
