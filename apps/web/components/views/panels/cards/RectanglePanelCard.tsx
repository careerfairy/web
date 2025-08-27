/* eslint-disable @next/next/no-img-element */
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Box, SxProps, Theme } from "@mui/material"
import { useUserIsRegistered } from "components/custom-hook/live-stream/useUserIsRegistered"
import useGroupsByIds from "components/custom-hook/useGroupsByIds"
import { combineStyles, sxStyles } from "types/commonTypes"
import {
   PanelCardBase,
   PanelDateBadge,
   PanelHostAvatars,
   PanelRegistrationStatus,
} from "./base/PanelCardBase"

const CARD_HEIGHT = 178

const styles = sxStyles({
   content: {
      minHeight: `${CARD_HEIGHT}px`,
   },
   topSection: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      p: 1.5,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
   },
   bottomSection: {
      position: "absolute",
      bottom: "12px",
      left: "12px",
      right: "12px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      height: "154px",
   },
   dateBadgeOverride: {
      position: "static",
      top: "auto",
      right: "auto",
   },
   titleImageContainer: {
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "flex-end",
      width: "100%",
   },
   titleImage: {
      maxWidth: "129px", // Consistent max width for all images
      height: "auto", // Height adjusts automatically to maintain aspect ratio
      objectFit: "contain", // Ensures image fits within bounds without distortion
      objectPosition: "bottom left", // Positions image at bottom left
      display: "block", // Removes any inline spacing issues
   },
   hostsContainer: {
      display: "flex",
      gap: 0.5,
      alignItems: "center",
   },
})

type RectanglePanelCardProps = {
   event: LivestreamEvent
   contentSx?: SxProps<Theme>
}

export const RectanglePanelCard = ({
   event,
   contentSx,
}: RectanglePanelCardProps) => {
   const isRegistered = useUserIsRegistered(event.id)

   const { data: groups } = useGroupsByIds(event.groupIds, false)

   const hostLogos =
      groups?.map((group) => group.logoUrl)?.filter(Boolean) ?? []

   return (
      <PanelCardBase
         event={event}
         backgroundSx={{
            "&::before": {
               background: `
                  linear-gradient(90deg, rgb(10, 8, 3) 45.19%, rgba(10, 8, 3, 0) 67.067%),
                  linear-gradient(90deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.1) 100%),
                  linear-gradient(rgba(0, 0, 0, 0) 65.561%, rgba(0, 0, 0, 0.38) 100%)
               `,
            },
            "&::after": {
               background: "none",
            },
         }}
      >
         <Box sx={combineStyles(styles.content, contentSx)}>
            <Box sx={styles.topSection}>
               <PanelRegistrationStatus isRegistered={isRegistered} />
               <Box sx={styles.dateBadgeOverride}>
                  <PanelDateBadge
                     startDate={event.start?.toDate()}
                     variant="default"
                  />
               </Box>
            </Box>

            <Box sx={styles.bottomSection}>
               <Box sx={styles.titleImageContainer}>
                  {event.panelLogoUrl ? (
                     <img
                        src={event.panelLogoUrl}
                        alt="Panel logo"
                        style={{
                           maxWidth: "116px",
                           height: "auto",
                           objectFit: "contain",
                           objectPosition: "bottom left",
                           display: "block",
                        }}
                     />
                  ) : null}
               </Box>
               <Box sx={styles.hostsContainer}>
                  <PanelHostAvatars size={28} logoUrls={hostLogos} />
               </Box>
            </Box>
         </Box>
      </PanelCardBase>
   )
}
