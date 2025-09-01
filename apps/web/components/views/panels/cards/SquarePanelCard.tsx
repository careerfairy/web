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
      justifyContent: "space-between",
      alignItems: "flex-start",
   },
   bottomSection: {
      width: "100%",
      position: "absolute",
      bottom: "0px",
      p: 1.5,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
   },
   bottomSectionSmallDesktop: {
      flexDirection: "column",
      alignItems: "center",
      gap: 1,
   },
   dateBadgeOverride: {
      position: "static",
      top: "auto",
      right: "auto",
   },
   titleImageOverride: {
      position: "static",
      height: "38px",
      aspectRatio: "9/4",
      maxWidth: "141px",
      backgroundSize: "contain",
      backgroundPosition: "bottom",
      backgroundRepeat: "no-repeat",
   },
   titleImageOverrideSmallDesktop: {
      maxWidth: "129px",
   },
   titleImageContainer: {
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "flex-end",
   },
   hostsContainer: {
      pl: 1,
      display: "flex",
      gap: 0.5,
      alignItems: "center",
   },
   hostsContainerSmallDesktop: {
      pl: 0,
   },
})

type SquarePanelCardProps = {
   event: LivestreamEvent
   fullHeight?: boolean
   fullRegistrationStatus?: boolean
   stackedBottomSection?: boolean
}

export const SquarePanelCard = ({
   event,
   fullHeight,
   fullRegistrationStatus,
   stackedBottomSection,
}: SquarePanelCardProps) => {
   const isRegistered = useUserIsRegistered(event.id)

   const { data: groups } = usePanelGroupsByIds(event.groupIds)

   const hostLogos =
      groups?.map((group) => group.logoUrl)?.filter(Boolean) ?? []

   return (
      <PanelCardBase
         event={event}
         rootSx={[styles.root, fullHeight ? { height: "100%" } : {}]}
         backgroundSx={{
            "&::before": {
               background: `
                  linear-gradient(90deg, rgba(0, 0, 0, 0.28) 0%, rgba(0, 0, 0, 0.28) 100%),
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
               <PanelRegistrationStatus
                  isRegistered={isRegistered}
                  variant={fullRegistrationStatus ? "default" : "small"}
               />
               <Box sx={styles.dateBadgeOverride}>
                  <PanelDateBadge
                     startDate={event.start?.toDate()}
                     variant="default"
                  />
               </Box>
            </Box>

            <Box
               sx={[
                  styles.bottomSection,
                  stackedBottomSection ? styles.bottomSectionSmallDesktop : {},
               ]}
            >
               <Box sx={styles.titleImageContainer}>
                  {event.panelLogoUrl ? (
                     <img
                        src={event.panelLogoUrl}
                        alt="Panel logo"
                        style={{
                           maxWidth: stackedBottomSection ? "100px" : "141px",
                           height: "auto",
                           objectFit: "contain",
                           objectPosition: "bottom left",
                           display: "block",
                        }}
                     />
                  ) : null}
               </Box>
               <Box
                  sx={[
                     styles.hostsContainer,
                     stackedBottomSection
                        ? styles.hostsContainerSmallDesktop
                        : {},
                  ]}
               >
                  <PanelHostAvatars size={28} logoUrls={hostLogos} />
               </Box>
            </Box>
         </Box>
      </PanelCardBase>
   )
}
