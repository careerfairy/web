import { Button, SwipeableDrawer } from "@mui/material"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import useIsMobile from "components/custom-hook/useIsMobile"
import { useCallback, useState } from "react"
import { sxStyles } from "types/commonTypes"
import BrandedDialog from "../../events/detail/form/views/questions/components/BrandedDialog"
import { useOfflineEventAutoSaveContext } from "./OfflineEventAutoSaveContext"
import { PublishConfirmation } from "./PublishConfirmation"
import { useOfflineEventFormValues } from "./form/useOfflineEventFormValues"

const styles = sxStyles({
   drawer: {
      ".MuiPaper-root": {
         borderTopLeftRadius: 12,
         borderTopRightRadius: 12,
      },
   },
   dialogPaper: {
      width: "514px",
   },
   button: {
      display: "flex",
      height: "40px",
      padding: "12px 24px !important",
   },
   paper: {
      m: 0,
   },
})

export const PublishButton = () => {
   const isMobile = useIsMobile()
   const { isValid } = useOfflineEventFormValues()
   const { isAutoSaving } = useOfflineEventAutoSaveContext()
   const [isDrawerOpen, setIsDrawerOpen] = useState(false)
   const [isDialogOpen, handleOpenDialog, handleCloseDialog] =
      useDialogStateHandler()

   const handlePublishButtonClick = useCallback(() => {
      if (isMobile) {
         setIsDrawerOpen(true)
      } else {
         handleOpenDialog()
      }
   }, [isMobile, handleOpenDialog])

   return (
      <>
         <Button
            variant="contained"
            color="secondary"
            sx={styles.button}
            disabled={!isValid || isAutoSaving}
            onClick={handlePublishButtonClick}
         >
            Publish
         </Button>

         {isMobile ? (
            <SwipeableDrawer
               anchor="bottom"
               onClose={() => setIsDrawerOpen(false)}
               onOpen={() => null}
               open={isDrawerOpen}
               sx={styles.drawer}
               PaperProps={{ sx: styles.paper }}
            >
               <PublishConfirmation
                  handleCancelClick={() => {
                     setIsDrawerOpen(false)
                  }}
               />
            </SwipeableDrawer>
         ) : (
            <BrandedDialog
               isDialogOpen={isDialogOpen}
               handleCloseDialog={handleCloseDialog}
               paperSx={styles.dialogPaper}
            >
               <PublishConfirmation handleCancelClick={handleCloseDialog} />
            </BrandedDialog>
         )}
      </>
   )
}
