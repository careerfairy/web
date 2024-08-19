import { Box } from "@mui/material"
import { useDeleteLivestreamPoll } from "components/custom-hook/streaming/useDeleteLivestreamPoll"
import ConfirmationDialog from "materialUI/GlobalModals/ConfirmationDialog"
import { Trash2 as DeleteIcon } from "react-feather"
import { useStreamingContext } from "../../context"

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

   return (
      <ConfirmationDialog
         open={open}
         title="Delete poll"
         description={`Are you sure you want to delete this poll? You will lose all voters' data, this action cannot be reversed.`}
         icon={<Box component={DeleteIcon} color="error.main" />}
         primaryAction={{
            text: "Delete",
            color: "error",
            callback: handleDelete,
            variant: "contained",
            loading: isMutating,
         }}
         secondaryAction={{
            text: "Cancel",
            color: "grey",
            callback: onClose,
            variant: "outlined",
         }}
         handleClose={onClose}
         hideCloseIcon
      />
   )
}
