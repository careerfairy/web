import { Box, Grow, Stack, Typography } from "@mui/material"
import { StreamerDetails } from "components/custom-hook/streaming/useStreamerDetails"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import { livestreamService } from "data/firebase/LivestreamService"
import { Info, MicOff } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { AnalyticsEvents } from "util/analyticsConstants"
import { dataLayerLivestreamEvent } from "util/analyticsUtils"
import { useStreamingContext } from "../../context"
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
   const [isStreamerInfoDialogOpen, handleDialogOpen, handleDialogClose] =
      useDialogStateHandler(false)
   const { livestreamId } = useStreamingContext()

   const displayName = getStreamerDisplayName(
      streamerDetails.firstName,
      streamerDetails.lastName
   )

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
               <Stack spacing={-0.5} minWidth={0}>
                  {Boolean(displayName) && (
                     <Typography variant="brandedBody" sx={styles.displayName}>
                        {displayName}
                     </Typography>
                  )}
                  {Boolean(streamerDetails.role) && (
                     <Typography sx={styles.role} variant="xsmall">
                        {streamerDetails.role}
                     </Typography>
                  )}
               </Stack>
               {Boolean(showIcons) && (
                  <Stack direction="row" spacing={1.5}>
                     <Grow in={!micActive} unmountOnExit>
                        <Box sx={styles.micOff} component={MicOff} size={20} />
                     </Grow>
                     <Box
                        component={Info}
                        onClick={async () => {
                           handleDialogOpen()

                           livestreamService
                              .getById(livestreamId)
                              .then((livestream) => {
                                 dataLayerLivestreamEvent(
                                    AnalyticsEvents.LivestreamSpeakerLinkedinClick,
                                    livestream,
                                    {
                                       speakerId: streamerDetails.id,
                                       speakerName: displayName,
                                    }
                                 )
                              })
                              .catch(console.error)
                        }}
                        sx={styles.detailsButton}
                        size={20}
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
