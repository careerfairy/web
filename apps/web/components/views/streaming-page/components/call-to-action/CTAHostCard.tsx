import { LivestreamCTA } from "@careerfairy/shared-lib/livestreams"
import { LoadingButton } from "@mui/lab"
import { Box, Stack, Typography } from "@mui/material"
import { useToggleActiveCTA } from "components/custom-hook/streaming/call-to-action/useToggleActiveCTA"
import { forwardRef, useState } from "react"
import { sxStyles } from "types/commonTypes"
import { useStreamingContext } from "../../context"
import { CTAOptionsMenu } from "./CTAOptionMenu"
import { CreateOrEditCTAForm } from "./CreateOrEditCTAForm"

export const styles = sxStyles({
   root: (theme) => ({
      border: `1px solid ${theme.brand.white[500]}`,
      backgroundColor: theme.brand.white[100],
      borderRadius: "11px",
      transition: theme.transitions.create("border"),
      overflow: "hidden",
      position: "relative",
      padding: "16px",
      gap: "24px",
      alignSelf: "stretch",
   }),
   greenBorder: {
      border: (theme) => `1.5px solid ${theme.palette.primary.main}`,
   },
   activeText: {
      color: (theme) => theme.palette.primary.main,
      fontWeight: 500,
   },
   options: {
      position: "absolute",
      top: 11,
      right: 12,
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
   buttonInfo: {
      alignItems: "flex-start",
      gap: "12px",
      color: "neutral.800",
   },
   buttonInfoContent: {
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
      alignSelf: "stretch",
   },
   buttonText: {
      alignItems: "flex-start",
      gap: "4px",
      flex: "1 0 0",
   },
   url: {
      wordBreak: "break-word",
   },
})

type Props = {
   cta: LivestreamCTA
   onClickDelete: (ctaId: string) => void
}

export const CTAHostCard = forwardRef<HTMLDivElement, Props>(
   ({ cta, onClickDelete }, ref) => {
      const [isEditing, setIsEditing] = useState(false)

      const handleCloseForm = () => {
         setIsEditing(false)
      }

      if (isEditing) {
         return (
            <CreateOrEditCTAForm
               cta={cta}
               onSuccess={handleCloseForm}
               onCancel={handleCloseForm}
            />
         )
      }

      return (
         <Stack sx={[styles.root, cta.active && styles.greenBorder]} ref={ref}>
            <Content cta={cta} />
            <StreamerActions cta={cta} />
            <Box component="span" sx={styles.options}>
               <CTAOptionsMenu
                  cta={cta}
                  onClickEdit={() => setIsEditing(true)}
                  onClickDelete={onClickDelete}
               />
            </Box>
         </Stack>
      )
   }
)

CTAHostCard.displayName = "CTACard"

type ContentProps = {
   cta: LivestreamCTA
}

const Content = ({ cta }: ContentProps) => {
   return (
      <Stack spacing={1.5}>
         {cta.active ? (
            <Typography sx={styles.activeText}>Active CTA</Typography>
         ) : null}

         <Stack sx={styles.message}>
            <Typography sx={styles.title} variant="brandedBody">
               Message
            </Typography>
            <Typography variant="brandedBody">{cta.message}</Typography>
         </Stack>
         <Stack sx={styles.buttonInfo}>
            <Box sx={styles.buttonInfoContent}>
               <Stack sx={styles.buttonText}>
                  <Typography variant="brandedBody" sx={styles.title}>
                     Button text
                  </Typography>
                  <Typography variant="brandedBody">
                     {cta.buttonText}
                  </Typography>
               </Stack>
               <Stack sx={styles.buttonText}>
                  <Typography variant="brandedBody" sx={styles.title}>
                     Clicks
                  </Typography>
                  <Typography variant="brandedBody">
                     {cta.numberOfUsersWhoClickedLink}
                  </Typography>
               </Stack>
            </Box>
            <Stack spacing={0.5}>
               <Typography variant="brandedBody" sx={styles.title}>
                  Button link
               </Typography>
               <Typography sx={styles.url} variant="brandedBody">
                  {cta.buttonURL}
               </Typography>
            </Stack>
         </Stack>
      </Stack>
   )
}

type StreamerActionsProps = {
   cta: LivestreamCTA
}

const StreamerActions = ({ cta }: StreamerActionsProps) => {
   const { streamerAuthToken, livestreamId } = useStreamingContext()
   const { trigger: toggleActiveCTA, isMutating: toggleActiveCTAPending } =
      useToggleActiveCTA(livestreamId, cta.id, streamerAuthToken)

   return (
      <LoadingButton
         color="primary"
         variant={cta.active ? "outlined" : "contained"}
         onClick={toggleActiveCTA}
         loading={toggleActiveCTAPending}
      >
         {cta.active ? "Deactivate call to action" : "Activate call to action"}
      </LoadingButton>
   )
}
