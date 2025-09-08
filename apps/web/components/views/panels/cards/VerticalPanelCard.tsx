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

const CARD_HEIGHT = 242

const styles = sxStyles({
   root: {
      width: "100%",
   },
   content: {
      minHeight: `${CARD_HEIGHT}px`,
   },
   topSection: {
      position: "absolute",
      flexDirection: "column",
      top: 0,
      left: 0,
      right: 0,
      p: 1.5,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
   },
   dateBadgeOverride: {
      position: "static",
      top: "auto",
      right: "auto",
   },
   bottomSection: {
      position: "absolute",
      bottom: "12px",
      left: "3.62%",
      right: "3.62%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 1.5,
   },
   hostsContainer: {
      display: "flex",
      gap: 0.5,
      alignItems: "center",
   },
   titleImageContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
   },
})

type VerticalPanelCardProps = {
   event: LivestreamEvent
}

export const VerticalPanelCard = ({ event }: VerticalPanelCardProps) => {
   const isRegistered = useUserIsRegistered(event.id)

   const { data: groups } = usePanelGroupsByIds(event.groupIds)

   const hostLogos =
      groups?.map((group) => group.logoUrl)?.filter(Boolean) ?? []

   return (
      <PanelCardBase
         event={event}
         rootSx={styles.root}
         backgroundSx={{
            "&::before": {
               background: `
                  linear-gradient(90deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.1) 100%),
                  linear-gradient(rgba(0, 0, 0, 0) 65.561%, rgba(0, 0, 0, 0.8) 100%)
               `,
            },
            "&::after": {
               background: "none",
            },
         }}
      >
         <Box sx={styles.content}>
            <Box sx={styles.topSection}>
               <Box sx={styles.dateBadgeOverride}>
                  <PanelDateBadge
                     startDate={event.start?.toDate()}
                     variant="default"
                  />
               </Box>
               <PanelRegistrationStatus
                  isRegistered={isRegistered}
                  variant="small"
               />
            </Box>

            <Box sx={styles.bottomSection}>
               <Box sx={styles.hostsContainer}>
                  <PanelHostAvatars size={28} logoUrls={hostLogos} />
               </Box>
               <Box sx={styles.titleImageContainer}>
                  {event.panelLogoUrl ? (
                     <img
                        src={event.panelLogoUrl}
                        alt="Panel logo"
                        style={{
                           maxWidth: "129px",
                           height: "auto",
                           objectFit: "contain",
                           objectPosition: "center",
                           display: "block",
                        }}
                     />
                  ) : null}
               </Box>
            </Box>
         </Box>
      </PanelCardBase>
   )
}
