import { Box, Grow, Stack, Typography } from "@mui/material"
import {
   useLivestreamData,
   useStreamIsMobile,
} from "components/custom-hook/streaming"
import { StreamerDetails } from "components/custom-hook/streaming/useStreamerDetails"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { Info, MicOff } from "react-feather"
import { useIsPanel } from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import { AnalyticsEvents } from "util/analyticsConstants"
import { dataLayerLivestreamEvent } from "util/analyticsUtils"
import { StreamerInfoDialog } from "../../streamer-info/StreamerInfoDialog"
import { getStreamerDisplayName } from "../../util"
import { FloatingContent } from "./VideoTrackWrapper"

const styles = sxStyles({
   root: {
      color: "white",
      p: {
         xs: 1,
         tablet: 2,
      },
      display: "flex",
   },
   leftContainer: {
      flex: 1,
      minWidth: 0,
      overflow: "hidden",
   },
   micOff: {
      color: "error.600",
   },
   displayName: {
      ...getMaxLineStyles(1),
      fontWeight: 600,
   },
   role: {
      ...getMaxLineStyles(1),
   },
   detailsButton: {
      cursor: "pointer",
   },
   companyLogo: {
      border: (theme) => `1px solid ${theme.brand.white[400]}`,
   },
   iconsContainer: {
      flex: "0 0 auto",
   },
})

type Props = {
   micActive: boolean
   streamerDetails: StreamerDetails
   showIcons: boolean
}

export const DetailsOverlay = ({
   micActive,
   streamerDetails,
   showIcons,
}: Props) => {
   const isPanel = useIsPanel()
   const isStreamerMobile = useStreamIsMobile()
   const [isStreamerInfoDialogOpen, handleDialogOpen, handleDialogClose] =
      useDialogStateHandler(false)

   const displayName = getStreamerDisplayName(
      streamerDetails.firstName,
      streamerDetails.lastName
   )

   const showCompanyName =
      isPanel &&
      streamerDetails.companyName &&
      streamerDetails.role !== "Moderator"

   const showCompanyLogo =
      !isStreamerMobile && Boolean(streamerDetails?.companyLogoUrl)

   return (
      <>
         <FloatingContent sx={styles.root}>
            <Stack
               mt="auto"
               width="100%"
               direction="row"
               justifyContent="space-between"
               alignItems="center"
               spacing={0.3}
            >
               <Stack direction="row" spacing={1.25} sx={styles.leftContainer}>
                  {showCompanyLogo ? (
                     <CircularLogo
                        src={streamerDetails.companyLogoUrl}
                        size={36}
                        alt={`${streamerDetails.companyName || "Company"} logo`}
                        objectFit="cover"
                        sx={styles.companyLogo}
                     />
                  ) : null}
                  <Stack spacing={-0.5} minWidth={0}>
                     {Boolean(displayName) && (
                        <Typography
                           variant="brandedBody"
                           sx={styles.displayName}
                        >
                           {displayName}
                        </Typography>
                     )}
                     {Boolean(streamerDetails.role) && (
                        <Typography sx={styles.role} variant="xsmall">
                           {streamerDetails.role}
                           {Boolean(showCompanyName) &&
                              ` at ${streamerDetails.companyName}`}
                        </Typography>
                     )}
                  </Stack>
               </Stack>
               {Boolean(showIcons) && (
                  <Stack
                     direction="row"
                     spacing={1.5}
                     sx={styles.iconsContainer}
                  >
                     <Grow in={!micActive} unmountOnExit>
                        <Box sx={styles.micOff} component={MicOff} size={20} />
                     </Grow>
                     <InfoButton
                        streamerDetails={streamerDetails}
                        displayName={displayName}
                        handleDialogOpen={handleDialogOpen}
                     />
                  </Stack>
               )}
            </Stack>
         </FloatingContent>
         <StreamerInfoDialog
            open={isStreamerInfoDialogOpen}
            handleClose={handleDialogClose}
            streamerDetails={streamerDetails}
         />
      </>
   )
}

type InfoButtonProps = {
   streamerDetails: StreamerDetails
   displayName: string
   handleDialogOpen: () => void
}

const InfoButton = ({
   streamerDetails,
   displayName,
   handleDialogOpen,
}: InfoButtonProps) => {
   const livestream = useLivestreamData()

   return (
      <Box
         component={Info}
         onClick={async () => {
            handleDialogOpen()

            if (livestream) {
               dataLayerLivestreamEvent(
                  AnalyticsEvents.LivestreamSpeakerLinkedinClick,
                  livestream,
                  {
                     speakerId: streamerDetails.id,
                     speakerName: displayName,
                  }
               )
            }
         }}
         sx={styles.detailsButton}
         size={20}
      />
   )
}
