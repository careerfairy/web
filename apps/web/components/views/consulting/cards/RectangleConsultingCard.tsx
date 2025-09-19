/* eslint-disable @next/next/no-img-element */
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Box, SxProps, Theme } from "@mui/material"
import { useUserIsRegistered } from "components/custom-hook/live-stream/useUserIsRegistered"
import { combineStyles, sxStyles } from "types/commonTypes"
import {
   ConsultingCardBase,
   ConsultingDateBadge,
   ConsultingHostAvatars,
   ConsultingRegistrationStatus,
} from "./base/ConsultingCardBase"

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
      maxWidth: "100%",
      maxHeight: "46px",
      width: "auto",
      height: "auto",
   },
   hostAvatarsContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: 1,
   },
})

type RectangleConsultingCardProps = {
   event: LivestreamEvent
   rootSx?: SxProps<Theme>
   onCardClick?: (eventId: string) => void
}

export const RectangleConsultingCard = ({
   event,
   rootSx,
   onCardClick,
}: RectangleConsultingCardProps) => {
   const { isRegistered } = useUserIsRegistered(event.id)
   const consultingCompanies = event.groupIds || []

   const companyLogoUrls = consultingCompanies
      .map((groupId) => {
         // This would need to be populated with actual company data
         return "" // Placeholder - in real implementation, fetch company logos
      })
      .filter(Boolean)

   return (
      <ConsultingCardBase
         event={event}
         rootSx={combineStyles(styles.content, rootSx)}
         onCardClick={onCardClick}
      >
         <Box sx={styles.topSection}>
            <ConsultingRegistrationStatus
               isRegistered={isRegistered}
               variant="small"
            />
            <ConsultingDateBadge
               startDate={event.startDate}
               variant="small"
            />
         </Box>

         <Box sx={styles.bottomSection}>
            <Box sx={styles.titleImageContainer}>
               {event.panelLogoUrl && (
                  <img
                     src={event.panelLogoUrl}
                     alt={event.title}
                     style={styles.titleImage}
                  />
               )}
            </Box>
            <Box sx={styles.hostAvatarsContainer}>
               {companyLogoUrls.length > 0 && (
                  <ConsultingHostAvatars logoUrls={companyLogoUrls} size={24} />
               )}
            </Box>
         </Box>
      </ConsultingCardBase>
   )
}