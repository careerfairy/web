import {
   CustomJob,
   JobApplicationContext,
   PublicCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { Dialog, DialogActions, DialogContent, Grow } from "@mui/material"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import CustomJobCTAButtons from "components/views/jobs/components/custom-jobs/CustomJobCTAButtons"
import CustomJobDetailsView from "components/views/jobs/components/custom-jobs/CustomJobDetailsView"
import { ReactNode, useCallback } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   title: {
      textTransform: "uppercase",
      fontWeight: "800",
   },
   body2: {
      fontSize: "1rem",
      mb: 3,
   },
   imageBox: {
      p: 0,
      "& img": {
         height: 50,
      },
   },
   titleBox: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
   },
   fixedBottomContent: {
      // position: "fixed",
      // bottom: 0,
      // width: "100%",
      p: 2.5,
      borderTop: "1px solid #F1F1F1",
      bgcolor: "background.paper",
      // display: "flex",
   },
})

type Props = {
   isOpen: boolean
   customJob: CustomJob
   context?: JobApplicationContext
   onClose?: () => void
   onApply?: () => void
   heroContent?: ReactNode
}

const CustomJobDetailsDialog = ({
   isOpen,
   customJob,
   context,
   onClose,
   onApply,
   heroContent,
}: Props) => {
   const [, , handleClose] = useDialogStateHandler(true)

   const onCloseDialog = useCallback(() => {
      handleClose()
      onClose && onClose()
   }, [handleClose, onClose])

   // TODO-WG: Use dialog state handler and move
   // use hero content for back buttons
   return (
      <Dialog
         maxWidth="md"
         scroll="paper"
         fullWidth
         TransitionComponent={Grow}
         open={isOpen}
         onClose={onCloseDialog}
      >
         <DialogContent
            sx={{
               p: 0,
               m: 0,
            }}
         >
            <CustomJobDetailsView
               job={customJob}
               heroContent={heroContent}
               sx={{ pt: "0px !important" }}
            />
         </DialogContent>
         <DialogActions sx={styles.fixedBottomContent}>
            <CustomJobCTAButtons
               applicationContext={context}
               job={customJob as PublicCustomJob}
               handleApplyClick={onApply}
            />
         </DialogActions>
      </Dialog>
   )
}

export default CustomJobDetailsDialog
