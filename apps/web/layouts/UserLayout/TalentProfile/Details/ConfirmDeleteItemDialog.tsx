import { Box } from "@mui/material"
import ConfirmationDialog from "materialUI/GlobalModals/ConfirmationDialog"
import { Trash2 as DeleteIcon } from "react-feather"
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
   handleDelete: () => Promise<void>
   isDeleting: boolean
   open: boolean
   onClose: () => void
}

export const ConfirmDeleteItemDialog = ({
   title,
   description,
   handleDelete,
   isDeleting,
   open,
   onClose,
}: Props) => {
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
            text: "Delete",
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
