import { Box } from "@mui/material"
import { useDeleteLivestreamCTA } from "components/custom-hook/streaming/call-to-action/useDeleteLivestreamCTA"
import ConfirmationDialog from "materialUI/GlobalModals/ConfirmationDialog"
import { Trash2 as DeleteIcon } from "react-feather"
import { useStreamingContext } from "../../context"

type Props = {
   ctaId: string
   open: boolean
   onClose: () => void
}

export const ConfirmDeleteCTADialog = ({ ctaId, open, onClose }: Props) => {
   const { livestreamId, streamerAuthToken } = useStreamingContext()

   const { trigger: deleteCTA, isMutating } = useDeleteLivestreamCTA(
      livestreamId,
      ctaId,
      streamerAuthToken
   )

   const handleDelete = async () => {
      await deleteCTA()
      onClose()
   }

   return (
      <ConfirmationDialog
         open={open}
         title="Delete call to action"
         description={`Are you sure you want to delete this call to action? You will lose all data, this action cannot be reversed.`}
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
