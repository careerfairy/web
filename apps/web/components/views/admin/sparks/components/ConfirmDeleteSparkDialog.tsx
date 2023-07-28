import Box from "@mui/material/Box"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { sparkService } from "data/firebase/SparksService"
import ConfirmationDialog, {
   ConfirmationDialogAction,
} from "materialUI/GlobalModals/ConfirmationDialog"
import { FC, useMemo, useState } from "react"
import { Trash2 as DeleteIcon } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   deleteIcon: {
      "& svg": {
         fontSize: 60,
         color: "error.main",
      },
   },
})

type Props = {
   sparkId: string
   groupId: string
   open: boolean
   handleClose: () => void
   onDeleted: () => void
}

const ConfirmDeleteSparkDialog: FC<Props> = ({
   sparkId,
   groupId,
   handleClose,
   onDeleted,
   open,
}) => {
   const [isDeletingSpark, setIsDeletingSpark] = useState(false)
   const { errorNotification } = useSnackbarNotifications()

   const primaryAction = useMemo<ConfirmationDialogAction>(
      () => ({
         callback: async () => {
            // Delete Spark
            setIsDeletingSpark(true)
            try {
               await sparkService.deleteSpark({
                  id: sparkId,
                  groupId,
               })

               onDeleted()
            } catch (error) {
               errorNotification(error, "Error deleting Spark", {
                  sparkId,
                  groupId,
               })
            } finally {
               setIsDeletingSpark(false)
               handleClose()
            }
         },
         text: "Delete",
         color: "error",
         variant: "contained",
         loading: isDeletingSpark,
      }),
      [
         errorNotification,
         groupId,
         handleClose,
         isDeletingSpark,
         onDeleted,
         sparkId,
      ]
   )

   const secondaryAction = useMemo<ConfirmationDialogAction>(
      () => ({
         callback: () => {
            handleClose()
         },
         text: "Cancel",
         color: "grey",
         variant: "outlined",
      }),
      [handleClose]
   )

   return (
      <ConfirmationDialog
         open={open}
         handleClose={handleClose}
         icon={
            <Box sx={styles.deleteIcon}>
               <DeleteIcon />
            </Box>
         }
         title="Delete Spark"
         description="Are you sure you want to delete this Spark? This action cannot be undone."
         primaryAction={primaryAction}
         secondaryAction={secondaryAction}
      />
   )
}

export default ConfirmDeleteSparkDialog
