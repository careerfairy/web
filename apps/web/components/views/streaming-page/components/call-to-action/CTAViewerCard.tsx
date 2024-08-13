import { LivestreamCTA } from "@careerfairy/shared-lib/livestreams"
import { Button, Stack, Typography } from "@mui/material"
import { useClickCTA } from "components/custom-hook/streaming/call-to-action/useClickCTA"
import { forwardRef } from "react"
import { sxStyles } from "types/commonTypes"
import { useStreamingContext } from "../../context"

export const styles = sxStyles({
   root: (theme) => ({
      border: `1px solid ${theme.brand.white[500]}`,
      backgroundColor: theme.brand.white[100],
      borderRadius: "12px",
      padding: "16px",
   }),
   content: {
      overflow: "hidden",
      gap: "20px",
      alignSelf: "stretch",
      alignItems: "flex-start",
   },

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
      return (
         <Stack sx={styles.root} ref={ref}>
            <CTAViewerCardContent cta={cta} />
         </Stack>
      )
   }
)

type ContentProps = {
   cta: LivestreamCTA
   onClick?: () => void
}

export const CTAViewerCardContent = ({ cta, onClick }: ContentProps) => {
   const { livestreamId, agoraUserId } = useStreamingContext()

   const { trigger: handleClick } = useClickCTA(
      livestreamId,
      cta.id,
      agoraUserId
   )

   return (
      <Stack sx={styles.content}>
         <Typography variant="brandedBody" sx={styles.message}>
            {cta.message}
         </Typography>
         <Button
            variant="contained"
            sx={styles.actionButton}
            href={cta.buttonURL}
            target="blank"
            onClick={() => {
               handleClick()
               onClick?.()
            }}
         >
            {cta.buttonText}
         </Button>
      </Stack>
   )
}

CTAViewerCard.displayName = "CTAViewerCard"
