import { sxStyles } from "@careerfairy/shared-ui"
import { Dialog, PaperProps } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { NICE_SCROLLBAR_STYLES } from "constants/layout"
import { ReactNode } from "react"
import { combineStyles } from "types/commonTypes"

const styles = sxStyles({
   dialogPaper: {
      ...NICE_SCROLLBAR_STYLES,
      display: "flex",
      flexDirection: "column",
      maxHeight: "none",
      maxWidth: "770px !important",
      overflowY: "hidden",
      top: {
         xs: "70px",
         md: 0,
      },
      borderRadius: {
         xs: "20px",
         md: "20px",
      },
   },
})

export type BrandedDialogProps = {
   isDialogOpen: boolean
   handleCloseDialog: () => void
   children: ReactNode
   paperSx?: PaperProps["sx"]
}

const BrandedDialog = ({
   isDialogOpen,
   handleCloseDialog,
   children,
   paperSx,
}: BrandedDialogProps) => {
   const isMobile = useIsMobile()

   return (
      <Dialog
         open={isDialogOpen}
         onClose={handleCloseDialog}
         maxWidth="md"
         fullWidth
         fullScreen={isMobile}
         PaperProps={{
            sx: combineStyles(styles.dialogPaper, paperSx),
         }}
      >
         {children}
      </Dialog>
   )
}

export default BrandedDialog
