import { LivestreamCTA } from "@careerfairy/shared-lib/livestreams"
import { Stack } from "@mui/material"
import { livestreamService } from "data/firebase/LivestreamService"
import { useCallback } from "react"
import { Link2 } from "react-feather"
import { useStreamingContext } from "../../context"
import { CTAViewerCardContent } from "../call-to-action/CTAViewerCard"
import { SnackbarNotification } from "./SnackbarNotification"
import { useSnackbarNotifications } from "./SnackbarNotificationsProvider"

type CTASnackbarCardProps = {
   cta: LivestreamCTA
}

export const CTASnackbarCard = ({ cta }: CTASnackbarCardProps) => {
   const { livestreamId, agoraUserId } = useStreamingContext()
   const { removeNotification } = useSnackbarNotifications()

   const dismissCTA = useCallback(
      (ctaId: string) => {
         livestreamService.dismissCTA(livestreamId, ctaId, agoraUserId)
         removeNotification(ctaId)
      },
      [livestreamId, removeNotification, agoraUserId]
   )
   return (
      <Stack spacing={1}>
         <SnackbarNotification.Header
            handleClose={() => dismissCTA(cta.id)}
            icon={<Link2 />}
         >
            Check out this link
         </SnackbarNotification.Header>
         <CTAViewerCardContent
            cta={cta}
            onClick={() => removeNotification(cta.id)}
         />
      </Stack>
   )
}
