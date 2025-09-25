import { sxStyles } from "@careerfairy/shared-ui"
import { Button, SwipeableDrawer } from "@mui/material"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import useIsMobile from "components/custom-hook/useIsMobile"
import { useCallback, useState } from "react"
import { useLivestreamCreationContext } from "./LivestreamCreationContext"
import { PublishConfirmation } from "./PublishConfirmation"
import { useAutoSave } from "./form/useAutoSave"
import { useLivestreamFormValues } from "./form/useLivestreamFormValues"
import BrandedDialog from "./form/views/questions/components/BrandedDialog"

const styles = sxStyles({
   drawer: {
      ".MuiPaper-root": {
         borderTopLeftRadius: 12,
         borderTopRightRadius: 12,
      },
   },
   dialogPaper: {
      width: "414px",
      height: "300px",
   },
   button: {
      display: "flex",
      height: "40px",
      padding: "12px 24px !important",
   },
})

export const PublishButton = () => {
   const isMobile = useIsMobile()
   const { isValid } = useLivestreamFormValues()
   const { livestream } = useLivestreamCreationContext()
   const { isAutoSaving } = useAutoSave()
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

   if (!livestream.isDraft) {
      return null
   }

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
