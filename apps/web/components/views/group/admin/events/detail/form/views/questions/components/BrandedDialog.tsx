import { FC, ReactNode } from "react"
import { sxStyles } from "@careerfairy/shared-ui"
import { combineStyles } from "types/commonTypes"
import { Dialog, PaperProps } from "@mui/material"
import { NICE_SCROLLBAR_STYLES } from "constants/layout"
import useIsMobile from "components/custom-hook/useIsMobile"

const styles = sxStyles({
   dialogPaper: {
      ...NICE_SCROLLBAR_STYLES,
      display: "flex",
      flexDirection: "column",
      maxHeight: "none",
      maxWidth: "770px !important",
      overflowY: "auto",
   },
})

export type BrandedDialogProps = {
   isDialogOpen: boolean
   handleCloseDialog: () => void
   children: ReactNode
   paperSx?: PaperProps["sx"]
}

const BrandedDialog: FC<BrandedDialogProps> = ({
   isDialogOpen,
   handleCloseDialog,
   children,
   paperSx,
}) => {
   const isMobile = useIsMobile()

   return (
      <Dialog
         key={`branded-dialog-${new Date().getMilliseconds()}`}
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
