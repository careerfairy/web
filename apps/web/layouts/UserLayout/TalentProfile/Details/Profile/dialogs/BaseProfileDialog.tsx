import { Button, Dialog, DialogActions, DialogContent } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { ReactNode } from "react"

type Props = {
   open: boolean
   children: ReactNode
   handleClose: () => void
   handleSave: () => void
   saveDisabled?: boolean
   saveText?: string
}
export const BaseProfileDialog = (props: Props) => {
   const {
      open,
      children,
      handleClose,
      handleSave,
      saveDisabled = true,
      saveText = "Save",
   } = props

   const isMobile = useIsMobile()

   return (
      <Dialog open={open} fullScreen={isMobile} closeAfterTransition={false}>
         <DialogContent>{children}</DialogContent>

         <DialogActions>
            <Button variant="outlined" onClick={handleClose}>
               Cancel
            </Button>
            <Button
               variant="contained"
               color="primary"
               disabled={saveDisabled}
               onClick={handleSave}
            >
               {saveText}
            </Button>
         </DialogActions>
      </Dialog>
   )
}
