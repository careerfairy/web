import React from "react"
import ConfirmationDialog, {
   ConfirmationDialogAction,
} from "materialUI/GlobalModals/ConfirmationDialog"
import { Trash2 as DeleteIcon } from "react-feather"
import { useDeleteLivestreamPoll } from "components/custom-hook/streaming/useDeleteLivestreamPoll"
import { useStreamingContext } from "../../context"
import { Box } from "@mui/material"

type Props = {
   pollId: string
   open: boolean
   onClose: () => void
}

export const ConfirmDeletePollDialog = ({ pollId, open, onClose }: Props) => {
   const { livestreamId, streamerAuthToken } = useStreamingContext()

   const { trigger: deletePoll, isMutating } = useDeleteLivestreamPoll(
      livestreamId,
      pollId,
      streamerAuthToken
   )

   const handleDelete = async () => {
      await deletePoll()
      onClose()
   }

   const primaryAction: ConfirmationDialogAction = {
      text: "Delete",
      color: "error",
      callback: handleDelete,
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
         title="Delete Poll"
         description={`Are you sure you want to delete this poll? You will lose all voters' data, this action cannot be reversed.`}
         icon={<Box component={DeleteIcon} color="error.main" />}
         primaryAction={primaryAction}
         secondaryAction={secondaryAction}
         handleClose={onClose}
         hideCloseIcon
      />
   )
}
