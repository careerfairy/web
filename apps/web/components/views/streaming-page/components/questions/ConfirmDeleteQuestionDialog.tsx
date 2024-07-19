import { Box } from "@mui/material"
import { useDeleteLivestreamQuestion } from "components/custom-hook/streaming/question"
import { livestreamService } from "data/firebase/LivestreamService"
import ConfirmationDialog from "materialUI/GlobalModals/ConfirmationDialog"
import { Trash2 as DeleteIcon } from "react-feather"
import { useStreamingContext } from "../../context"

type Props = {
   questionId: string
   open: boolean
   onClose: () => void
}

export const ConfirmDeleteQuestionDialog = ({
   questionId,
   open,
   onClose,
}: Props) => {
   const { livestreamId } = useStreamingContext()

   const { trigger: triggerDeleteQuestion, isMutating: isDeletingQuestion } =
      useDeleteLivestreamQuestion(
         livestreamService.getLivestreamRef(livestreamId),
         questionId
      )

   const handleDelete = async () => {
      await triggerDeleteQuestion()
      onClose()
   }

   return (
      <ConfirmationDialog
         open={open}
         title="Delete question"
         description={`Are you sure you want to delete this question?`}
         icon={<Box component={DeleteIcon} color="error.main" />}
         primaryAction={{
            text: "Delete",
            color: "error",
            callback: handleDelete,
            variant: "contained",
            loading: isDeletingQuestion,
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
