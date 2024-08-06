import { LivestreamCTA } from "@careerfairy/shared-lib/livestreams"
import { Button, Stack, Typography } from "@mui/material"
import { useClickCTA } from "components/custom-hook/streaming/call-to-action/useClickCTA"
import { useAuth } from "HOCs/AuthProvider"
import { forwardRef } from "react"
import { useOpenStream } from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import { useStreamingContext } from "../../context"

export const styles = sxStyles({
   root: (theme) => ({
      border: `1px solid ${theme.brand.white[500]}`,
      backgroundColor: theme.brand.white[100],
      borderRadius: "12px",
      overflow: "hidden",
      padding: "16px",
      gap: "16px",
      alignSelf: "stretch",
      alignItems: "flex-start",
   }),

   title: {
      fontWeight: 600,
   },
   message: {
      gap: "4px",
      alignSelf: "stretch",
      wordBreak: "break-word",
      whiteSpace: "pre-line",
      color: "neutral.800",
   },
   actionButton: {
      justifyContent: "center",
      alignItems: "center",
      gap: "8px",
      alignSelf: "stretch",
   },
})

type Props = {
   cta: LivestreamCTA
}

export const CTAViewerCard = forwardRef<HTMLDivElement, Props>(
   ({ cta }, ref) => {
      const { livestreamId, agoraUserId } = useStreamingContext()
      const { authenticatedUser } = useAuth()
      const isOpenStream = useOpenStream()

      const userId = isOpenStream
         ? agoraUserId
         : authenticatedUser?.email || agoraUserId

      const { trigger: handleClick } = useClickCTA(livestreamId, cta.id, userId)

      return (
         <Stack sx={styles.root} ref={ref}>
            <Typography variant="brandedBody" sx={styles.message}>
               {cta.message}
            </Typography>
            <Button
               variant="contained"
               sx={styles.actionButton}
               href={cta.buttonURL}
               target="blank"
               onClick={() => handleClick()}
            >
               {cta.buttonText}
            </Button>
         </Stack>
      )
   }
)

CTAViewerCard.displayName = "CTACard"
