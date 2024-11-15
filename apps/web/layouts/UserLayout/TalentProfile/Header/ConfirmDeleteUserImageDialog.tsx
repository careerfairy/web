import { Box } from "@mui/material"
import ConfirmationDialog from "materialUI/GlobalModals/ConfirmationDialog"
import { Trash2 as DeleteIcon } from "react-feather"
import { TriggerWithoutArgs } from "swr/mutation"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   dialog: {
      zIndex: (theme) => theme.zIndex.modal,
   },
   deleteIcon: {
      width: "48px !important",
      height: "48px !important",
   },
})

type Props = {
   title: string
   description: string
   triggerDeleteImage: TriggerWithoutArgs<void, any, string, never>
   isDeleting: boolean
   open: boolean
   onClose: () => void
}

export const ConfirmDeleteUserImageDialog = ({
   title,
   description,
   triggerDeleteImage,
   isDeleting,
   open,
   onClose,
}: Props) => {
   const handleDelete = async () => {
      await triggerDeleteImage()
      onClose()
   }

   return (
      <ConfirmationDialog
         open={open}
         title={title}
         description={description}
         icon={
            <Box
               component={DeleteIcon}
               color="error.main"
               sx={styles.deleteIcon}
            />
         }
         primaryAction={{
            text: "Remove",
            color: "error",
            callback: handleDelete,
            variant: "contained",
            loading: isDeleting,
         }}
         secondaryAction={{
            text: "Cancel",
            color: "grey",
            callback: onClose,
            variant: "outlined",
         }}
         handleClose={onClose}
         hideCloseIcon
         sx={styles.dialog}
      />
   )
}
