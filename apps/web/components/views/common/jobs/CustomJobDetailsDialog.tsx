import {
   CustomJob,
   JobApplicationContext,
   PublicCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import {
   Dialog,
   DialogActions,
   DialogContent,
   Grow,
   SxProps,
} from "@mui/material"
import { DefaultTheme } from "@mui/styles/defaultTheme"
import useCustomJobApply from "components/custom-hook/custom-job/useCustomJobApply"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import useGroupsByIds from "components/custom-hook/useGroupsByIds"
import useIsMobile from "components/custom-hook/useIsMobile"
import CustomJobApplyConfirmation from "components/views/jobs/components/custom-jobs/CustomJobApplyConfirmation"
import CustomJobCTAButtons from "components/views/jobs/components/custom-jobs/CustomJobCTAButtons"
import CustomJobDetailsView from "components/views/jobs/components/custom-jobs/CustomJobDetailsView"
import { ReactNode, useCallback } from "react"
import { useSelector } from "react-redux"
import { AutomaticActions } from "store/reducers/sparksFeedReducer"
import { autoAction } from "store/selectors/sparksFeedSelectors"
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
      p: 2.5,
      borderTop: "1px solid #F1F1F1",
      bgcolor: "background.paper",
   },

   jobApplyConfirmationDialog: {
      m: 2,
   },
})

type Props = {
   isOpen: boolean
   customJob: CustomJob
   context?: JobApplicationContext
   onClose?: () => void
   heroContent?: ReactNode
   heroSx?: SxProps<DefaultTheme>
}

const CustomJobDetailsDialog = ({
   isOpen,
   customJob,
   context,
   onClose,
   heroContent,
   heroSx,
}: Props) => {
   const [, , handleClose] = useDialogStateHandler(true)
   const { handleClickApplyBtn, applicationInitiatedOnly, handleConfirmApply } =
      useCustomJobApply(customJob as PublicCustomJob, context)
   const [
      isConfirmApplyOpened,
      handleConfirmApplyOpen,
      handleConfirmApplyClose,
   ] = useDialogStateHandler(applicationInitiatedOnly)
   const isMobile = useIsMobile()
   const onCloseDialog = useCallback(() => {
      handleClose()
      onClose && onClose()
   }, [handleClose, onClose])

   const {
      data: [group],
   } = useGroupsByIds([customJob.groupId])

   const autoActionType = useSelector(autoAction)

   const isAutoApply = autoActionType === AutomaticActions.APPLY

   return (
      <Dialog
         maxWidth={"md"}
         scroll="paper"
         fullWidth
         fullScreen={isMobile}
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
               applicationInitiatedOnly={applicationInitiatedOnly}
               heroSx={heroSx}
               sx={{ pt: "0px !important" }}
               companyLogoUrl={group.logoUrl}
               companyName={group.universityName}
               hideCTAButtons
            />
            {isConfirmApplyOpened ? (
               <CustomJobApplyConfirmation
                  handleClose={handleConfirmApplyClose}
                  job={customJob as PublicCustomJob}
                  applicationContext={context}
                  autoApply={isAutoApply}
                  onApply={() => {
                     handleConfirmApplyClose()
                     handleConfirmApply
                  }}
                  sx={styles.jobApplyConfirmationDialog}
               />
            ) : null}
         </DialogContent>
         <DialogActions sx={styles.fixedBottomContent}>
            <CustomJobCTAButtons
               applicationContext={context}
               job={customJob as PublicCustomJob}
               handleApplyClick={() => {
                  handleConfirmApplyOpen()
                  handleClickApplyBtn()
               }}
            />
         </DialogActions>
      </Dialog>
   )
}

export default CustomJobDetailsDialog
