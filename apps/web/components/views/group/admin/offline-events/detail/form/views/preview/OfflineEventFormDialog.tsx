import { sxStyles } from "@careerfairy/shared-ui"
import {
   Dialog,
   DialogContent,
   DialogProps,
   SwipeableDrawerProps,
   SxProps,
} from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import BrandedSwipeableDrawer from "components/views/common/inputs/BrandedSwipeableDrawer"
import { SlideUpTransition } from "components/views/common/transitions"
import { NICE_SCROLLBAR_STYLES } from "constants/layout"
import { ReactNode } from "react"
import OfflineEventFormPreviewContent from "./OfflineEventFormPreviewContent"

const styles = sxStyles({
   dialogContent: {
      padding: 0,
   },
   dialogPaper: {
      ...NICE_SCROLLBAR_STYLES,
      borderRadius: {
         md: 5,
      },
      maxHeight: "700px",
   },
   drawerPaper: {
      ...NICE_SCROLLBAR_STYLES,
      maxHeight: "90vh",
      borderTopLeftRadius: "18px",
      borderTopRightRadius: "18px",
   },
})

type CustomResponsiveDialogProps = {
   handleClose?: () => unknown
   open: boolean
   children: ReactNode
   hideDragHandle?: boolean
   dialogPaperStyles?: SxProps
   drawerPaperStyles?: SxProps
   TransitionComponent?: DialogProps["TransitionComponent"]
   SlideProps?: SwipeableDrawerProps["SlideProps"]
   TransitionProps?: DialogProps["TransitionProps"]
   dataTestId?: string
}

const CustomResponsiveDialog = ({
   children,
   open,
   handleClose,
   hideDragHandle,
   dialogPaperStyles,
   drawerPaperStyles,
   TransitionComponent,
   SlideProps,
   TransitionProps,
   dataTestId,
}: CustomResponsiveDialogProps) => {
   const isMobile = useIsMobile()

   if (isMobile) {
      return (
         <BrandedSwipeableDrawer
            open={open}
            anchor="bottom"
            PaperProps={{
               sx: drawerPaperStyles,
               "data-testid": dataTestId,
            }}
            onOpen={() => {}}
            onClose={handleClose}
            disableEnforceFocus
            hideDragHandle={hideDragHandle}
            SlideProps={SlideProps}
         >
            {children}
         </BrandedSwipeableDrawer>
      )
   }
   return (
      <Dialog
         open={open}
         maxWidth={"md"}
         onClose={handleClose}
         PaperProps={{
            sx: dialogPaperStyles,
            "data-testid": dataTestId,
         }}
         fullWidth
         disableEnforceFocus
         TransitionComponent={TransitionComponent}
         TransitionProps={TransitionProps}
      >
         {children}
      </Dialog>
   )
}

type OfflineEventFormDialogProps = {
   isOpen: boolean
   handleClose: () => void
}

const OfflineEventFormDialog = ({
   isOpen,
   handleClose,
}: OfflineEventFormDialogProps) => {
   return (
      <CustomResponsiveDialog
         open={isOpen}
         handleClose={handleClose}
         TransitionComponent={SlideUpTransition}
         dialogPaperStyles={styles.dialogPaper}
         drawerPaperStyles={styles.drawerPaper}
         dataTestId="offline-event-preview-dialog"
      >
         <DialogContent sx={styles.dialogContent}>
            <OfflineEventFormPreviewContent
               isInDialog={true}
               handleCloseDialog={handleClose}
            />
         </DialogContent>
      </CustomResponsiveDialog>
   )
}

export default OfflineEventFormDialog
