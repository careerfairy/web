import { Button, Stack, Typography, useTheme } from "@mui/material"
import { useCallback } from "react"
import { CheckCircle } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { errorLogAndNotify } from "util/CommonUtil"
import { useOfflineEventCreationContext } from "./OfflineEventCreationContext"
import { usePublishOfflineEvent } from "./form/usePublishOfflineEvent"

const styles = sxStyles({
   button: {
      px: 4,
   },
})

export type PublishConfirmationProps = {
   handleCancelClick: () => void
}

export const PublishConfirmation = ({
   handleCancelClick,
}: PublishConfirmationProps) => {
   const theme = useTheme()
   const { offlineEvent, group } = useOfflineEventCreationContext()
   const { isPublishing, publishOfflineEvent } = usePublishOfflineEvent()

   const handlePublishClick = useCallback(async () => {
      try {
         await publishOfflineEvent()
      } catch (error) {
         errorLogAndNotify(error, {
            message: "Failed to publish offline event",
            offlineEventId: offlineEvent.id,
            groupId: group.id,
         })
      } finally {
         handleCancelClick()
      }
   }, [publishOfflineEvent, handleCancelClick, offlineEvent, group])

   return (
      <Stack
         p={"20px 48px"}
         alignItems={"space-between"}
         textAlign={"center"}
         spacing={"20px"}
      >
         <Stack spacing={2} alignItems={"center"}>
            <CheckCircle color={theme.palette.secondary[500]} size={40} />
            <Typography
               variant="brandedH4"
               color="text.primary"
               fontWeight={600}
            >
               Publish Offline Event
            </Typography>

            <Typography variant="medium" color="text.secondary">
               Are you sure you want to publish this offline event? Once
               published, it will be visible to users and you can make further
               changes.
            </Typography>
         </Stack>

         <Stack direction="row" justifyContent={"center"} spacing={2}>
            <Button
               variant="outlined"
               color="grey"
               sx={styles.button}
               onClick={handleCancelClick}
               disabled={isPublishing}
            >
               Cancel
            </Button>

            <Button
               variant="contained"
               color="secondary"
               sx={styles.button}
               onClick={handlePublishClick}
               disabled={isPublishing}
            >
               {isPublishing ? "Publishing..." : "Publish"}
            </Button>
         </Stack>
      </Stack>
   )
}
