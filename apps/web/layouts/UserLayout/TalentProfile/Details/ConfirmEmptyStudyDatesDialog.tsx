import { Box } from "@mui/material"
import ConfirmationDialog from "materialUI/GlobalModals/ConfirmationDialog"
import { Calendar } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   dialog: {
      zIndex: (theme) => theme.zIndex.modal,
   },
   calendarIcon: {
      color: (theme) => theme.brand.warning[500],
      width: "48px !important",
      height: "48px !important",
   },
   addDates: {
      p: "8px 24px",
      borderRadius: "20px",
      backgroundColor: (theme) => theme.brand.warning[600],
      color: (theme) => theme.brand.white[50],
      "&:hover": {
         backgroundColor: (theme) => theme.brand.warning[700],
      },
   },
})

type Props = {
   maybeLater: () => Promise<void>
   isSubmitting: boolean
   open: boolean
   onClose: () => void
}

export const ConfirmEmptyStudyDatesDialog = ({
   maybeLater,
   isSubmitting,
   open,
   onClose,
}: Props) => {
   const handleMaybeLater = async () => {
      await maybeLater()
      onClose()
   }

   return (
      <ConfirmationDialog
         open={open}
         title={"Make it count"}
         description={
            "Add your start and end dates to get better recommendations. We'll show you  what actually matters, right when you need it."
         }
         icon={<Box component={Calendar} sx={styles.calendarIcon} />}
         primaryAction={{
            text: "Add dates",
            sx: styles.addDates,
            callback: onClose,
            variant: "contained",
            loading: isSubmitting,
         }}
         secondaryAction={{
            text: "Maybe later",
            color: "grey",
            callback: handleMaybeLater,
            variant: "outlined",
         }}
         handleClose={onClose}
         hideCloseIcon
         sx={styles.dialog}
      />
   )
}
