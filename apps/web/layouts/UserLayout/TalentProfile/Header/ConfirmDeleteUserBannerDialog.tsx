import { Box } from "@mui/material"
import { useDeleteUserBannerImage } from "components/custom-hook/user/useDeleteUserBannerImage"
import ConfirmationDialog from "materialUI/GlobalModals/ConfirmationDialog"
import { Trash2 as DeleteIcon } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   dialog: {
      zIndex: 1300,
   },
})

type Props = {
   userId: string
   open: boolean
   onClose: () => void
}

export const ConfirmDeleteUserBannerDialog = ({
   userId,
   open,
   onClose,
}: Props) => {
   const {
      trigger: triggerDeleteUserBanner,
      isMutating: isDeletingUserBanner,
   } = useDeleteUserBannerImage(userId)

   const handleDelete = async () => {
      await triggerDeleteUserBanner()
      onClose()
   }

   return (
      <ConfirmationDialog
         open={open}
         title="Remove banner image?"
         description={`Are you sure you want to remove your banner image?`}
         icon={<Box component={DeleteIcon} color="error.main" />}
         primaryAction={{
            text: "Remove",
            color: "error",
            callback: handleDelete,
            variant: "contained",
            loading: isDeletingUserBanner,
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
