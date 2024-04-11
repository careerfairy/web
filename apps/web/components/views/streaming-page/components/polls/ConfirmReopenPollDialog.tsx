import React from "react"
import ConfirmationDialog, {
   ConfirmationDialogAction,
} from "materialUI/GlobalModals/ConfirmationDialog"
import { RefreshCw as ReopenIcon } from "react-feather"
import { useStartLivestreamPoll } from "components/custom-hook/streaming/useStartLivestreamPoll"
import { useStreamingContext } from "../../context"
import { Box } from "@mui/material"

type Props = {
   pollId: string
   open: boolean
   onClose: () => void
   onPollStarted?: () => void
}

export const ConfirmReopenPollDialog = ({
   pollId,
   open,
   onClose,
   onPollStarted,
}: Props) => {
   const { livestreamId, streamerAuthToken } = useStreamingContext()

   const { trigger: startPoll, isMutating } = useStartLivestreamPoll(
      livestreamId,
      pollId,
      streamerAuthToken
   )

   const handleReopen = async () => {
      await startPoll()
      onPollStarted?.()
      onClose()
   }

   const primaryAction: ConfirmationDialogAction = {
      text: "Reopen",
      color: "primary",
      callback: handleReopen,
      variant: "contained",
      loading: isMutating,
   }

   const secondaryAction: ConfirmationDialogAction = {
      text: "Cancel",
      color: "grey",
      callback: onClose,
      variant: "outlined",
   }

   return (
      <ConfirmationDialog
         open={open}
         handleClose={onClose}
         title="Reopen poll?"
         description="Are you sure you want to reopen this poll?"
         icon={<Box component={ReopenIcon} color="primary.main" />}
         primaryAction={primaryAction}
         secondaryAction={secondaryAction}
         hideCloseIcon
      />
   )
}
